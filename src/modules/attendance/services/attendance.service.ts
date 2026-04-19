import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../common/constants';
import {
  AttendanceRecordStatus,
  AttendanceSessionStatus,
  AttendanceType,
} from '../../../common/domain/enums';
import type {
  AttendanceRepository,
  RawAttendanceSessionEntity,
} from '../../../packages/domain';
import { IngestRecognitionEventDto, CreateAttendanceSessionDto } from '../dtos';
import type { AuthenticatedUser } from '../../auth/interfaces';

@Injectable()
export class AttendanceService {
  constructor(
    @Inject(REPOSITORY_TOKENS.ATTENDANCE)
    private readonly attendanceRepository: AttendanceRepository,
  ) {}

  async createSession(
    currentUser: AuthenticatedUser,
    createAttendanceSessionDto: CreateAttendanceSessionDto,
  ) {
    const classEntity = await this.findClassOrThrow(
      createAttendanceSessionDto.classId,
    );
    this.ensureCanManageSession(currentUser, classEntity.teacherId);

    const activeSession = classEntity.attendanceSessions.find(
      (session) => session.status === AttendanceSessionStatus.ACTIVE,
    );

    if (activeSession) {
      throw new ConflictException(
        'This class already has an active attendance session',
      );
    }

    const session = await this.attendanceRepository.createSession({
      classId: classEntity.id,
      createdById: currentUser.id,
      startTime: createAttendanceSessionDto.startTime
        ? new Date(createAttendanceSessionDto.startTime)
        : new Date(),
      attendanceType:
        createAttendanceSessionDto.attendanceType ?? AttendanceType.AUTOMATIC,
      confidenceThreshold:
        createAttendanceSessionDto.confidenceThreshold ?? null,
      status: AttendanceSessionStatus.ACTIVE,
    });

    return this.serializeSession(session);
  }

  async listSessions(
    currentUser: AuthenticatedUser,
    status?: AttendanceSessionStatus,
  ) {
    const sessions = await this.attendanceRepository.listSessions();

    return sessions
      .filter((session) => this.canAccessSession(currentUser, session))
      .filter((session) => (status ? session.status === status : true))
      .map((session) => this.serializeSession(session));
  }

  async getSessionById(currentUser: AuthenticatedUser, sessionId: number) {
    const session = await this.findSessionOrThrow(sessionId);
    this.ensureCanAccessSession(currentUser, session);

    return this.serializeSession(session);
  }

  async closeSession(currentUser: AuthenticatedUser, sessionId: number) {
    const session = await this.findSessionOrThrow(sessionId);
    this.ensureCanManageSession(currentUser, session.classEntity.teacherId);

    if (session.status === AttendanceSessionStatus.CLOSED) {
      throw new ConflictException('Attendance session is already closed');
    }

    session.status = AttendanceSessionStatus.CLOSED;
    session.endTime = new Date();
    await this.attendanceRepository.saveSession(session);

    return {
      message: 'Attendance session closed successfully',
    };
  }

  async ingestRecognitionEvent(
    sessionId: number,
    ingestRecognitionEventDto: IngestRecognitionEventDto,
  ) {
    const session = await this.findSessionOrThrow(sessionId);

    if (session.status !== AttendanceSessionStatus.ACTIVE) {
      throw new ConflictException(
        'Recognition events can only be ingested for active sessions',
      );
    }

    const recognitionEvent =
      await this.attendanceRepository.createRecognitionEvent({
        sessionId,
        frameId: ingestRecognitionEventDto.frameId,
        imageFileId: ingestRecognitionEventDto.imageFileId ?? null,
        detectedStudentId: ingestRecognitionEventDto.candidateUserId ?? null,
        matchedEmbeddingId:
          ingestRecognitionEventDto.matchedEmbeddingId ?? null,
        confidenceScore: ingestRecognitionEventDto.confidenceScore ?? null,
        similarityScore: ingestRecognitionEventDto.similarityScore ?? null,
        isRealFace: ingestRecognitionEventDto.isRealFace ?? true,
        antiSpoofingScore: ingestRecognitionEventDto.antiSpoofingScore ?? null,
        boundingBox: ingestRecognitionEventDto.boundingBox ?? null,
        detectorModel: ingestRecognitionEventDto.detectorModel ?? 'unknown',
        detectorModelVersion:
          ingestRecognitionEventDto.detectorModelVersion ?? null,
        recognitionModel:
          ingestRecognitionEventDto.recognitionModel ?? 'unknown',
        recognitionModelVersion:
          ingestRecognitionEventDto.recognitionModelVersion ?? 'unknown',
        antiSpoofingModel: ingestRecognitionEventDto.antiSpoofingModel ?? null,
        antiSpoofingModelVersion:
          ingestRecognitionEventDto.antiSpoofingModelVersion ?? null,
        metadata: {
          ...(ingestRecognitionEventDto.metadata ?? {}),
          sourceDeviceId: ingestRecognitionEventDto.sourceDeviceId,
        },
      });

    const decision = await this.applyRecognitionDecision(
      session,
      recognitionEvent.id,
      ingestRecognitionEventDto,
    );

    return {
      recognitionEventId: recognitionEvent.id,
      attendanceRecordId: decision.attendanceRecordId,
      decision: decision.decision,
      reason: decision.reason,
    };
  }

  private async applyRecognitionDecision(
    session: RawAttendanceSessionEntity,
    recognitionEventId: number,
    event: IngestRecognitionEventDto,
  ) {
    if (!event.isRealFace) {
      return {
        attendanceRecordId: null,
        decision: 'ignored',
        reason:
          'Recognition event ignored because anti-spoofing flagged a fake face',
      };
    }

    if (event.candidateUserId == null) {
      return {
        attendanceRecordId: null,
        decision: 'ignored',
        reason:
          'Recognition event ignored because no candidate user was returned',
      };
    }

    const isMember = session.classEntity.classMembers.some(
      (member) => member.studentId === event.candidateUserId,
    );

    if (!isMember) {
      return {
        attendanceRecordId: null,
        decision: 'rejected',
        reason: 'Recognized user is not a member of this class',
      };
    }

    const sessionThreshold = session.confidenceThreshold ?? 0.8;
    const confidenceScore = event.confidenceScore ?? event.similarityScore ?? 0;

    if (confidenceScore < sessionThreshold) {
      return {
        attendanceRecordId: null,
        decision: 'rejected',
        reason:
          'Recognition event confidence is below the configured session threshold',
      };
    }

    const existingRecord = await this.attendanceRepository.findAttendanceRecord(
      session.id,
      event.candidateUserId,
    );

    if (existingRecord) {
      existingRecord.status = AttendanceRecordStatus.PRESENT;
      existingRecord.confidenceScore = confidenceScore;
      existingRecord.imageFileId = event.imageFileId ?? null;
      existingRecord.recognitionEventId = recognitionEventId;
      const savedRecord =
        await this.attendanceRepository.saveAttendanceRecord(existingRecord);

      return {
        attendanceRecordId: savedRecord.id,
        decision: 'attendance_updated',
        reason:
          'Recognition event accepted and the existing attendance record was updated',
      };
    }

    const createdRecord =
      await this.attendanceRepository.createAttendanceRecord({
        sessionId: session.id,
        studentId: event.candidateUserId,
        status: AttendanceRecordStatus.PRESENT,
        confidenceScore,
        imageFileId: event.imageFileId ?? null,
        recognitionEventId,
      });

    return {
      attendanceRecordId: createdRecord.id,
      decision: 'attendance_marked',
      reason: 'Recognition event accepted and attendance recorded',
    };
  }

  private serializeSession(session: RawAttendanceSessionEntity) {
    const presentCount = session.records.filter(
      (record) => record.status === AttendanceRecordStatus.PRESENT,
    ).length;

    return {
      id: session.id,
      classId: session.classId,
      className: session.classEntity.className,
      createdById: session.createdById,
      startTime: session.startTime,
      endTime: session.endTime,
      attendanceType: session.attendanceType,
      confidenceThreshold: session.confidenceThreshold,
      status: session.status,
      classMemberCount: session.classEntity.classMembers.length,
      recognitionEventCount: session.recognitionEvents.length,
      presentCount,
      records: session.records.map((record) => ({
        id: record.id,
        studentId: record.studentId,
        status: record.status,
        confidenceScore: record.confidenceScore,
        recognitionEventId: record.recognitionEventId,
        recordedAt: record.recordedAt,
      })),
    };
  }

  private canAccessSession(
    currentUser: AuthenticatedUser,
    session: RawAttendanceSessionEntity,
  ): boolean {
    if (currentUser.role === 'admin') {
      return true;
    }

    if (currentUser.role === 'teacher') {
      return session.classEntity.teacherId === currentUser.id;
    }

    return session.classEntity.classMembers.some(
      (member) => member.studentId === currentUser.id,
    );
  }

  private ensureCanAccessSession(
    currentUser: AuthenticatedUser,
    session: RawAttendanceSessionEntity,
  ) {
    if (!this.canAccessSession(currentUser, session)) {
      throw new ForbiddenException(
        'You do not have permission to access this attendance session',
      );
    }
  }

  private ensureCanManageSession(
    currentUser: AuthenticatedUser,
    teacherId: number,
  ) {
    if (
      currentUser.role !== 'admin' &&
      !(currentUser.role === 'teacher' && teacherId === currentUser.id)
    ) {
      throw new ForbiddenException(
        'You do not have permission to manage this attendance session',
      );
    }
  }

  private async findSessionOrThrow(sessionId: number) {
    const session = await this.attendanceRepository.findSessionById(sessionId);

    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }

    return session;
  }

  private async findClassOrThrow(classId: number) {
    const classEntity = await this.attendanceRepository.findClassById(classId);

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    if (!classEntity.classMembers.length) {
      throw new BadRequestException(
        'Cannot create an attendance session for a class without students',
      );
    }

    return classEntity;
  }
}
