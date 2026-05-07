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
  ApprovalStatus,
  FaceImagePose,
  FaceRegistrationEmbeddingStatus,
  FaceRegistrationSessionStatus,
} from '../../../common/domain/enums';
import type {
  FacesRepository,
  RawFaceImageEntity,
  RawFaceRegistrationRequestEntity,
} from '../../../packages/domain';
import { AI_PROVIDER_TOKEN } from '../../ai-integration';
import type { FaceAiProvider } from '../../ai-integration';
import type { AuthenticatedUser } from '../../auth/interfaces';
import { FilesService } from '../../files/services';
import {
  BuildFaceRegistrationEmbeddingsDto,
  CreateFaceRegistrationSessionDto,
  FaceRegistrationEmbeddingsBuildResponseDto,
  FaceRegistrationSessionResponseDto,
  UploadFaceRegistrationSampleDto,
} from '../dtos';
import { FACE_REGISTRATION_REQUIRED_POSES } from '../faces.constants';

type UploadableFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class FacesService {
  constructor(
    @Inject(REPOSITORY_TOKENS.FACES)
    private readonly facesRepository: FacesRepository,
    private readonly filesService: FilesService,
    @Inject(AI_PROVIDER_TOKEN)
    private readonly aiProvider: FaceAiProvider,
  ) {}

  async createSession(
    currentUser: AuthenticatedUser,
    dto: CreateFaceRegistrationSessionDto,
  ): Promise<FaceRegistrationSessionResponseDto> {
    const existingCollectingSession =
      await this.facesRepository.findActiveSessionByStudentId(currentUser.id);

    if (existingCollectingSession) {
      throw new ConflictException(
        'A collecting face registration session already exists for this student',
      );
    }

    const session = await this.facesRepository.createSession({
      studentId: currentUser.id,
      status: ApprovalStatus.PENDING,
      sessionStatus: FaceRegistrationSessionStatus.COLLECTING,
      embeddingStatus: FaceRegistrationEmbeddingStatus.NOT_STARTED,
      targetCountPerPose: dto.targetCountPerPose ?? 20,
      metadata: {
        registrationFlow: 'continuous_multi_sample_capture',
      },
    });

    return this.serializeSession(session);
  }

  async getLatestSessionForStudent(
    currentUser: AuthenticatedUser,
  ): Promise<FaceRegistrationSessionResponseDto> {
    const session = await this.facesRepository.findLatestSessionByStudentId(
      currentUser.id,
    );

    if (!session) {
      throw new NotFoundException('No face registration session found');
    }

    return this.serializeSession(session);
  }

  async getSessionByIdForUser(
    sessionId: number,
    currentUser: AuthenticatedUser,
  ): Promise<FaceRegistrationSessionResponseDto> {
    const session = await this.findSessionOrThrow(sessionId);
    this.ensureCanAccessSession(currentUser, session);

    return this.serializeSession(session);
  }

  async uploadSessionSample(
    sessionId: number,
    currentUser: AuthenticatedUser,
    file: UploadableFile,
    dto: UploadFaceRegistrationSampleDto,
  ): Promise<FaceRegistrationSessionResponseDto> {
    if (!file.buffer.length) {
      throw new BadRequestException('Uploaded image cannot be empty');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Uploaded file must be an image');
    }

    const session = await this.findSessionOrThrow(sessionId);

    if (session.studentId !== currentUser.id) {
      throw new ForbiddenException(
        'You can only upload samples to your own face registration session',
      );
    }

    if (session.sessionStatus !== FaceRegistrationSessionStatus.COLLECTING) {
      throw new ConflictException(
        'Only collecting face registration sessions can receive new samples',
      );
    }

    const poseSampleCount =
      await this.facesRepository.countSessionSamplesByPose(sessionId, dto.pose);

    if (poseSampleCount >= session.targetCountPerPose) {
      throw new ConflictException(
        `Pose "${dto.pose}" already reached the target sample count`,
      );
    }

    const rawFile = await this.filesService.storeUploadedFile({
      uploaderId: currentUser.id,
      file,
      category: `face_registration_raw/${dto.pose}`,
    });

    const alignedFileId = dto.alignedImageBase64
      ? (
          await this.storeAlignedImage(
            currentUser.id,
            dto.pose,
            dto.alignedImageBase64,
          )
        ).id
      : null;

    await this.facesRepository.createSample({
      studentId: currentUser.id,
      requestId: sessionId,
      fileId: rawFile.id,
      alignedFileId,
      pose: dto.pose,
      status: ApprovalStatus.APPROVED,
      captureSource: dto.captureSource ?? 'web_realtime_ai_registration',
      qualityScore: dto.qualityScore ?? null,
      capturedAt: dto.capturedAt ? new Date(dto.capturedAt) : new Date(),
      metadata: this.buildSampleMetadata(dto),
    });

    return this.serializeSession(await this.findSessionOrThrow(sessionId));
  }

  async completeSession(
    sessionId: number,
    currentUser: AuthenticatedUser,
  ): Promise<FaceRegistrationSessionResponseDto> {
    const session = await this.findSessionOrThrow(sessionId);

    if (session.studentId !== currentUser.id) {
      throw new ForbiddenException(
        'You can only complete your own face registration session',
      );
    }

    if (session.sessionStatus !== FaceRegistrationSessionStatus.COLLECTING) {
      throw new ConflictException('Only collecting sessions can be completed');
    }

    const counts = await this.getSampleCountByPose(session);
    const incompletePose = FACE_REGISTRATION_REQUIRED_POSES.find(
      (pose) => counts[pose] < session.targetCountPerPose,
    );

    if (incompletePose) {
      throw new BadRequestException(
        `Pose "${incompletePose}" has not reached the target sample count yet`,
      );
    }

    session.sessionStatus = FaceRegistrationSessionStatus.COMPLETED;
    session.completedAt = new Date();
    session.embeddingStatus = FaceRegistrationEmbeddingStatus.NOT_STARTED;

    await this.facesRepository.saveSession(session);

    return this.serializeSession(await this.findSessionOrThrow(sessionId));
  }

  async buildEmbeddingsForSession(
    sessionId: number,
    currentUser: AuthenticatedUser,
    dto: BuildFaceRegistrationEmbeddingsDto,
  ): Promise<FaceRegistrationEmbeddingsBuildResponseDto> {
    const session = await this.findSessionOrThrow(sessionId);
    this.ensureCanAccessSession(currentUser, session);

    if (
      ![
        FaceRegistrationSessionStatus.COMPLETED,
        FaceRegistrationSessionStatus.EMBEDDING_FAILED,
        FaceRegistrationSessionStatus.EMBEDDING_COMPLETED,
      ].includes(session.sessionStatus)
    ) {
      throw new ConflictException(
        'Embeddings can only be built after the session is completed',
      );
    }

    const samples = this.sortSamples(session.faceImages);
    if (!samples.length) {
      throw new BadRequestException(
        'Cannot build embeddings for a session without samples',
      );
    }

    session.sessionStatus = FaceRegistrationSessionStatus.EMBEDDING_PENDING;
    session.embeddingStatus = FaceRegistrationEmbeddingStatus.PENDING;
    await this.facesRepository.saveSession(session);

    try {
      if (dto.replaceExisting !== false) {
        await this.facesRepository.deleteEmbeddingsByFaceImageIds(
          samples.map((sample) => sample.id),
        );
      }

      const result = await this.aiProvider.generateFaceEmbeddings({
        requestId: session.id,
        studentId: session.studentId,
        images: await Promise.all(
          samples.map(async (sample) => {
            const sourceFile = sample.alignedFile ?? sample.file;
            const serialized =
              await this.filesService.serializeUploadedFileWithSignedUrl(
                sourceFile,
              );
            return {
              faceImageId: sample.id,
              url: serialized.url,
              pose: sample.pose,
            };
          }),
        ),
      });

      await this.facesRepository.createEmbeddings(
        result.embeddings.map((embedding) => ({
          studentId: session.studentId,
          faceImageId: embedding.faceImageId,
          embedding: embedding.embedding,
          modelName: embedding.modelName,
          modelVersion: embedding.modelVersion,
          distanceMetric: embedding.distanceMetric,
          embeddingDimension: embedding.embeddingDimension,
          isActive: embedding.isActive,
          preprocessProfile: embedding.preprocessProfile,
          isL2Normalized: embedding.isL2Normalized,
          metadata: embedding.metadata ?? null,
        })),
      );

      session.sessionStatus = FaceRegistrationSessionStatus.EMBEDDING_COMPLETED;
      session.embeddingStatus = FaceRegistrationEmbeddingStatus.COMPLETED;
      await this.facesRepository.saveSession(session);

      return {
        sessionId: session.id,
        requestedSampleCount: samples.length,
        generatedEmbeddingCount: result.embeddings.length,
        status: session.sessionStatus,
        embeddingStatus: session.embeddingStatus,
      };
    } catch (error) {
      session.sessionStatus = FaceRegistrationSessionStatus.EMBEDDING_FAILED;
      session.embeddingStatus = FaceRegistrationEmbeddingStatus.FAILED;
      session.metadata = {
        ...(session.metadata ?? {}),
        lastEmbeddingFailure:
          error instanceof Error ? error.message : 'Unknown embedding failure',
      };
      await this.facesRepository.saveSession(session);
      throw error;
    }
  }

  private async serializeSession(
    session: RawFaceRegistrationRequestEntity,
  ): Promise<FaceRegistrationSessionResponseDto> {
    const samples = this.sortSamples(session.faceImages);
    const sampleCountByPose = await this.getSampleCountByPose(session);
    const requiredTotalSamples =
      FACE_REGISTRATION_REQUIRED_POSES.length * session.targetCountPerPose;

    return {
      id: session.id,
      studentId: session.studentId,
      status: session.sessionStatus,
      embeddingStatus: session.embeddingStatus,
      currentPose: this.resolveCurrentPose(sampleCountByPose, session),
      targetCountPerPose: session.targetCountPerPose,
      requiredTotalSamples,
      totalAcceptedSamples: samples.length,
      sampleCountByPose,
      createdAt: session.createdAt,
      completedAt: session.completedAt,
      updatedAt: session.updatedAt,
      samples: await Promise.all(
        samples.map(async (sample) => ({
          id: sample.id,
          pose: sample.pose,
          captureSource: sample.captureSource,
          capturedAt: sample.capturedAt,
          qualityScore: sample.qualityScore,
          createdAt: sample.createdAt,
          rawFile: await this.filesService.serializeUploadedFileWithSignedUrl(
            sample.file,
          ),
          alignedFile: sample.alignedFile
            ? await this.filesService.serializeUploadedFileWithSignedUrl(
                sample.alignedFile,
              )
            : null,
          metadata: sample.metadata,
        })),
      ),
      metadata: session.metadata,
    };
  }

  private ensureCanAccessSession(
    currentUser: AuthenticatedUser,
    session: RawFaceRegistrationRequestEntity,
  ) {
    if (currentUser.role !== 'admin' && currentUser.id !== session.studentId) {
      throw new ForbiddenException(
        'You do not have permission to access this face registration session',
      );
    }
  }

  private async findSessionOrThrow(
    sessionId: number,
  ): Promise<RawFaceRegistrationRequestEntity> {
    const session = await this.facesRepository.findSessionById(sessionId);

    if (!session) {
      throw new NotFoundException('Face registration session not found');
    }

    return session;
  }

  private async getSampleCountByPose(
    session: RawFaceRegistrationRequestEntity,
  ): Promise<Record<FaceImagePose, number>> {
    const initial = Object.fromEntries(
      FACE_REGISTRATION_REQUIRED_POSES.map((pose) => [pose, 0]),
    ) as Record<FaceImagePose, number>;

    for (const sample of session.faceImages) {
      initial[sample.pose] = (initial[sample.pose] ?? 0) + 1;
    }

    return initial;
  }

  private resolveCurrentPose(
    sampleCountByPose: Record<FaceImagePose, number>,
    session: RawFaceRegistrationRequestEntity,
  ): FaceImagePose | null {
    return (
      FACE_REGISTRATION_REQUIRED_POSES.find(
        (pose) => sampleCountByPose[pose] < session.targetCountPerPose,
      ) ?? null
    );
  }

  private sortSamples(samples: RawFaceImageEntity[]): RawFaceImageEntity[] {
    return [...samples].sort(
      (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
    );
  }

  private buildSampleMetadata(
    dto: UploadFaceRegistrationSampleDto,
  ): Record<string, unknown> {
    return {
      registrationFlow: 'continuous_multi_sample_capture',
      pose: dto.pose,
      aiValidated: dto.aiValidated ?? true,
      detectionScore: dto.detectionScore ?? null,
      faceCount: dto.faceCount ?? null,
      estimatedPose: dto.estimatedPose ?? null,
      bbox: this.tryParseJson(dto.bbox) ?? dto.bbox ?? null,
      landmarks: this.tryParseJson(dto.landmarks) ?? dto.landmarks ?? null,
      aiMetadata: this.tryParseJson(dto.aiMetadata) ?? dto.aiMetadata ?? null,
    };
  }

  private async storeAlignedImage(
    uploaderId: number,
    pose: FaceImagePose,
    base64DataUrl: string,
  ) {
    const parsed = this.parseDataUrl(base64DataUrl);
    return this.filesService.storeUploadedFile({
      uploaderId,
      category: `face_registration_aligned/${pose}`,
      file: {
        originalname: `aligned-${pose}.jpg`,
        mimetype: parsed.mimeType,
        size: parsed.buffer.length,
        buffer: parsed.buffer,
      },
    });
  }

  private parseDataUrl(dataUrl: string): { mimeType: string; buffer: Buffer } {
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
      throw new BadRequestException(
        'Invalid base64 data URL for aligned image',
      );
    }

    const [, mimeType, payload] = match;
    return {
      mimeType,
      buffer: Buffer.from(payload, 'base64'),
    };
  }

  private tryParseJson(value: unknown): unknown {
    if (typeof value !== 'string') {
      return value;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
}
