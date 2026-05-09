import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentSessionStatus } from '../../../common/domain/enums';
import {
  EnrollmentSessionEntity,
  FaceEmbeddingEntity,
  PrototypeEmbeddingEntity,
} from '../../../packages/infrastructure/entities';
import { AI_PROVIDER_TOKEN } from '../../ai-integration';
import type {
  FaceAiProvider,
  ProcessEnrollmentVideoInput,
} from '../../ai-integration/interfaces';
import { FilesService } from '../../files/services';

@Injectable()
export class EnrollmentProcessingWorkerService {
  private readonly logger = new Logger(EnrollmentProcessingWorkerService.name);

  constructor(
    @InjectRepository(EnrollmentSessionEntity)
    private readonly enrollmentSessionsRepository: Repository<EnrollmentSessionEntity>,
    @InjectRepository(FaceEmbeddingEntity)
    private readonly faceEmbeddingsRepository: Repository<FaceEmbeddingEntity>,
    @InjectRepository(PrototypeEmbeddingEntity)
    private readonly prototypeEmbeddingsRepository: Repository<PrototypeEmbeddingEntity>,
    private readonly filesService: FilesService,
    @Inject(AI_PROVIDER_TOKEN)
    private readonly faceAiProvider: FaceAiProvider,
  ) {}

  async process(payload: ProcessEnrollmentVideoInput, jobId: string | null) {
    const session = await this.enrollmentSessionsRepository.findOne({
      where: { id: payload.sessionId },
    });

    if (!session) {
      this.logger.warn(
        `Enrollment session ${payload.sessionId} not found for queued job`,
      );
      return;
    }

    session.status = EnrollmentSessionStatus.PROCESSING;
    session.jobId = jobId;
    session.failureReason = null;
    session.processingStartedAt = new Date();
    await this.enrollmentSessionsRepository.save(session);

    try {
      const videoUrl = await this.filesService.buildSignedObjectUrl(
        payload.videoObjectKey,
      );
      const result = await this.faceAiProvider.processEnrollmentVideo({
        ...payload,
        videoUrl,
      });

      await this.faceEmbeddingsRepository.update(
        { studentId: session.studentId, isActive: true },
        { isActive: false },
      );
      await this.faceEmbeddingsRepository.delete({
        enrollmentSessionId: session.id,
      });

      const embeddings = result.embeddings.map((embedding) =>
        this.faceEmbeddingsRepository.create({
          studentId: session.studentId,
          faceImageId: null,
          enrollmentSessionId: session.id,
          embedding: embedding.embedding,
          modelName: embedding.modelName,
          modelVersion: embedding.modelVersion,
          distanceMetric: 'cosine',
          embeddingDimension: embedding.embedding.length,
          isActive: true,
          preprocessProfile: 'video_enrollment',
          isL2Normalized: true,
          qualityScore: embedding.qualityScore ?? null,
          yaw: embedding.yaw ?? null,
          pitch: embedding.pitch ?? null,
          roll: embedding.roll ?? null,
          metadata: {
            frameIndex: embedding.frameIndex,
            source: 'video_enrollment',
          },
        }),
      );

      if (embeddings.length) {
        await this.faceEmbeddingsRepository.save(embeddings);
      }

      await this.prototypeEmbeddingsRepository.save(
        this.prototypeEmbeddingsRepository.create({
          studentId: session.studentId,
          embedding: result.prototypeEmbedding,
          modelName: result.prototypeModelName,
          modelVersion: result.prototypeModelVersion,
          metadata: {
            sourceSessionId: session.id,
            acceptedFrameCount: result.acceptedFrameCount,
            rejectedFrameStats: result.rejectedFrameStats,
          },
        }),
      );

      session.status = EnrollmentSessionStatus.COMPLETED;
      session.embeddingCount = embeddings.length;
      session.prototypeReady = true;
      session.processingCompletedAt = new Date();
      session.processingSummary = {
        acceptedFrameCount: result.acceptedFrameCount,
        rejectedFrameStats: result.rejectedFrameStats,
        thresholdsUsed: result.thresholdsUsed,
        qualitySummary: result.qualitySummary,
        processingStats: result.processingStats,
      };
      await this.enrollmentSessionsRepository.save(session);
    } catch (error) {
      session.status = EnrollmentSessionStatus.FAILED;
      session.processingCompletedAt = new Date();
      session.failureReason =
        error instanceof Error ? error.message : 'Enrollment processing failed';
      await this.enrollmentSessionsRepository.save(session);
      throw error;
    }
  }
}
