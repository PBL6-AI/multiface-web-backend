import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EnrollmentSessionStatus } from '../../../common/domain/enums';
import {
  EnrollmentSessionEntity,
  PrototypeEmbeddingEntity,
} from '../../../packages/infrastructure/entities';
import type { AuthenticatedUser } from '../../auth/interfaces';
import { FilesService } from '../../files/services';
import type {
  CompleteEnrollmentSessionDto,
  CreateEnrollmentSessionDto,
  EnrollmentSessionResponseDto,
} from '../dtos';
import { EnrollmentQueueService } from './enrollment-queue.service';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(EnrollmentSessionEntity)
    private readonly enrollmentSessionsRepository: Repository<EnrollmentSessionEntity>,
    @InjectRepository(PrototypeEmbeddingEntity)
    private readonly prototypeEmbeddingsRepository: Repository<PrototypeEmbeddingEntity>,
    private readonly filesService: FilesService,
    private readonly enrollmentQueueService: EnrollmentQueueService,
  ) {}

  async createSession(
    currentUser: AuthenticatedUser,
    dto: CreateEnrollmentSessionDto,
  ): Promise<EnrollmentSessionResponseDto> {
    const lockInfo = await this.resolveRegistrationLockInfo(currentUser.id);
    if (lockInfo.locked) {
      throw new ConflictException(
        lockInfo.reason ??
          'Face enrollment is already completed for this student',
      );
    }

    this.filesService.ensureEnrollmentVideoPayloadIsValid({
      filename: dto.filename,
      mimeType: dto.mimeType,
      size: dto.fileSize,
    });

    const activeProcessingSession =
      await this.enrollmentSessionsRepository.findOne({
        where: {
          studentId: currentUser.id,
          status: In([
            EnrollmentSessionStatus.CREATED,
            EnrollmentSessionStatus.UPLOADING,
            EnrollmentSessionStatus.UPLOADED,
            EnrollmentSessionStatus.QUEUED,
            EnrollmentSessionStatus.PROCESSING,
          ]),
        },
        order: { createdAt: 'DESC' },
      });

    if (activeProcessingSession) {
      throw new ConflictException(
        'A face enrollment session is already in progress for this student',
      );
    }

    const draftSession = await this.enrollmentSessionsRepository.save(
      this.enrollmentSessionsRepository.create({
        studentId: currentUser.id,
        videoObjectKey: 'pending',
        videoFilename: dto.filename,
        videoMimeType: dto.mimeType,
        videoSize: dto.fileSize,
        status: EnrollmentSessionStatus.CREATED,
        metadata: {
          source: 'web_video_enrollment',
        },
      }),
    );

    const upload = await this.filesService.createPresignedEnrollmentVideoUpload(
      {
        studentId: currentUser.id,
        sessionId: draftSession.id,
        filename: dto.filename,
        mimeType: dto.mimeType,
      },
    );

    draftSession.videoObjectKey = upload.objectKey;
    draftSession.status = EnrollmentSessionStatus.UPLOADING;
    const savedSession =
      await this.enrollmentSessionsRepository.save(draftSession);

    return this.serializeSession(savedSession, upload);
  }

  async completeSession(
    currentUser: AuthenticatedUser,
    dto: CompleteEnrollmentSessionDto,
  ): Promise<EnrollmentSessionResponseDto> {
    const session = await this.findSessionOrThrow(dto.sessionId);
    this.ensureCanAccessSession(currentUser, session);

    if (session.studentId !== currentUser.id) {
      throw new ForbiddenException(
        'You can only complete your own enrollment session',
      );
    }

    const exists = await this.filesService.objectExists(session.videoObjectKey);
    if (!exists) {
      throw new ConflictException(
        'Enrollment video upload has not completed yet',
      );
    }

    session.status = EnrollmentSessionStatus.UPLOADED;
    session.failureReason = null;
    await this.enrollmentSessionsRepository.save(session);

    const job = await this.enrollmentQueueService.enqueueEnrollmentProcessing({
      sessionId: session.id,
      studentId: session.studentId,
      videoObjectKey: session.videoObjectKey,
      requestedAt: new Date().toISOString(),
    });

    session.status = EnrollmentSessionStatus.QUEUED;
    session.jobId = job.id ? String(job.id) : null;
    const savedSession = await this.enrollmentSessionsRepository.save(session);

    return this.serializeSession(savedSession);
  }

  async getLatestSessionForStudent(
    currentUser: AuthenticatedUser,
  ): Promise<EnrollmentSessionResponseDto> {
    const session = await this.enrollmentSessionsRepository.findOne({
      where: { studentId: currentUser.id },
      order: { createdAt: 'DESC' },
    });

    if (!session) {
      throw new NotFoundException('No enrollment session found');
    }

    return this.serializeSession(session);
  }

  async getSessionByIdForUser(
    sessionId: number,
    currentUser: AuthenticatedUser,
  ): Promise<EnrollmentSessionResponseDto> {
    const session = await this.findSessionOrThrow(sessionId);
    this.ensureCanAccessSession(currentUser, session);

    return this.serializeSession(session);
  }

  private async findSessionOrThrow(sessionId: number) {
    const session = await this.enrollmentSessionsRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Enrollment session not found');
    }

    return session;
  }

  private ensureCanAccessSession(
    currentUser: AuthenticatedUser,
    session: EnrollmentSessionEntity,
  ) {
    if (currentUser.role !== 'admin' && currentUser.id !== session.studentId) {
      throw new ForbiddenException(
        'You do not have permission to access this enrollment session',
      );
    }
  }

  private async serializeSession(
    session: EnrollmentSessionEntity,
    upload?: {
      objectKey: string;
      uploadUrl: string;
      expiresInSeconds: number;
    } | null,
  ): Promise<EnrollmentSessionResponseDto> {
    const lockInfo = await this.resolveRegistrationLockInfo(session.studentId);
    const videoUrl =
      session.status === EnrollmentSessionStatus.CREATED ||
      session.status === EnrollmentSessionStatus.UPLOADING
        ? null
        : await this.filesService.buildSignedObjectUrl(session.videoObjectKey);

    return {
      id: session.id,
      studentId: session.studentId,
      status: session.status,
      videoFilename: session.videoFilename,
      videoMimeType: session.videoMimeType,
      videoSize: session.videoSize,
      videoUrl,
      videoObjectKey: session.videoObjectKey,
      upload: upload
        ? {
            objectKey: upload.objectKey,
            uploadUrl: upload.uploadUrl,
            expiresInSeconds: upload.expiresInSeconds,
          }
        : null,
      embeddingCount: session.embeddingCount,
      prototypeReady: session.prototypeReady,
      registrationLocked: lockInfo.locked,
      registrationLockReason: lockInfo.reason,
      failureReason: session.failureReason,
      processingSummary: session.processingSummary,
      metadata: session.metadata,
      jobId: session.jobId,
      processingStartedAt: session.processingStartedAt,
      processingCompletedAt: session.processingCompletedAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }

  private async resolveRegistrationLockInfo(studentId: number): Promise<{
    locked: boolean;
    reason: string | null;
  }> {
    const prototype = await this.prototypeEmbeddingsRepository.findOne({
      where: { studentId },
    });

    if (prototype) {
      return {
        locked: true,
        reason:
          'You have already completed face enrollment and cannot register again.',
      };
    }

    return {
      locked: false,
      reason: null,
    };
  }
}
