import { getRepositoryToken } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../../common/constants';
import {
  ApprovalStatus,
  FaceImagePose,
  FaceRegistrationSessionStatus,
} from '../../../common/domain/enums';
import { In, Repository } from 'typeorm';
import type {
  CreateFaceImageRecordInput,
  CreateFaceEmbeddingRecordInput,
  CreateFaceRegistrationRequestRecordInput,
  FacesRepository,
  ListFaceRegistrationRequestsOptions,
  RawFaceEmbeddingEntity,
  RawFaceImageEntity,
  RawFaceRegistrationRequestEntity,
  ClosestEmbeddingResult,
} from '../../domain';
import {
  FaceEmbeddingEntity,
  FaceImageEntity,
  FaceRegistrationRequestEntity,
  PrototypeEmbeddingEntity,
} from '../entities';

export class TypeOrmFacesRepository implements FacesRepository {
  constructor(
    private readonly faceRegistrationRequestsRepository: Repository<FaceRegistrationRequestEntity>,
    private readonly faceImagesRepository: Repository<FaceImageEntity>,
    private readonly faceEmbeddingsRepository: Repository<FaceEmbeddingEntity>,
    private readonly prototypeEmbeddingsRepository: Repository<PrototypeEmbeddingEntity>,
  ) {}

  async findSessionById(
    sessionId: number,
  ): Promise<RawFaceRegistrationRequestEntity | null> {
    return this.faceRegistrationRequestsRepository.findOne({
      where: { id: sessionId },
      relations: this.requestRelations,
    });
  }

  async findLatestSessionByStudentId(
    studentId: number,
  ): Promise<RawFaceRegistrationRequestEntity | null> {
    return this.faceRegistrationRequestsRepository.findOne({
      where: { studentId },
      relations: this.requestRelations,
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveSessionByStudentId(
    studentId: number,
  ): Promise<RawFaceRegistrationRequestEntity | null> {
    return this.faceRegistrationRequestsRepository.findOne({
      where: {
        studentId,
        sessionStatus: FaceRegistrationSessionStatus.COLLECTING,
      },
      relations: this.requestRelations,
      order: { createdAt: 'DESC' },
    });
  }

  async createSession(
    input: CreateFaceRegistrationRequestRecordInput,
  ): Promise<RawFaceRegistrationRequestEntity> {
    const savedRequest = await this.faceRegistrationRequestsRepository.save(
      this.faceRegistrationRequestsRepository.create({
        studentId: input.studentId,
        status: input.status ?? ApprovalStatus.PENDING,
        sessionStatus:
          input.sessionStatus ?? FaceRegistrationSessionStatus.COLLECTING,
        embeddingStatus: input.embeddingStatus,
        targetCountPerPose: input.targetCountPerPose ?? 20,
        completedAt: input.completedAt ?? null,
        metadata: input.metadata ?? null,
      }),
    );

    const request = await this.findSessionById(savedRequest.id);

    if (!request) {
      throw new Error('Face registration request was created but not reloaded');
    }

    return request;
  }

  async createSample(
    input: CreateFaceImageRecordInput,
  ): Promise<RawFaceImageEntity> {
    return this.faceImagesRepository.save(
      this.faceImagesRepository.create({
        studentId: input.studentId,
        requestId: input.requestId,
        fileId: input.fileId,
        alignedFileId: input.alignedFileId ?? null,
        pose: input.pose,
        status: input.status ?? ApprovalStatus.PENDING,
        reviewedById: input.reviewedById ?? null,
        reviewedAt: input.reviewedAt ?? null,
        rejectionReason: input.rejectionReason ?? null,
        captureSource: input.captureSource ?? 'web_registration',
        qualityScore: input.qualityScore ?? null,
        capturedAt: input.capturedAt ?? null,
        metadata: input.metadata ?? null,
      }),
    );
  }

  async countSessionSamplesByPose(
    requestId: number,
    pose: FaceImagePose,
  ): Promise<number> {
    return this.faceImagesRepository.count({
      where: { requestId, pose },
    });
  }

  async countSessionSamples(requestId: number): Promise<number> {
    return this.faceImagesRepository.count({
      where: { requestId },
    });
  }

  async listSessions(
    options?: ListFaceRegistrationRequestsOptions,
  ): Promise<RawFaceRegistrationRequestEntity[]> {
    const where = {
      ...(options?.studentId ? { studentId: options.studentId } : {}),
      ...(options?.sessionStatus
        ? { sessionStatus: options.sessionStatus }
        : {}),
    };

    return this.faceRegistrationRequestsRepository.find({
      where,
      relations: this.requestRelations,
      order: { createdAt: 'DESC' },
    });
  }

  async saveSession(
    request: RawFaceRegistrationRequestEntity,
  ): Promise<RawFaceRegistrationRequestEntity> {
    const savedRequest =
      await this.faceRegistrationRequestsRepository.save(request);
    const reloadedRequest = await this.findSessionById(savedRequest.id);

    if (!reloadedRequest) {
      throw new Error('Face registration request was saved but not reloaded');
    }

    return reloadedRequest;
  }

  async saveSamples(
    images: RawFaceImageEntity[],
  ): Promise<RawFaceImageEntity[]> {
    return this.faceImagesRepository.save(images);
  }

  async createEmbeddings(
    inputs: CreateFaceEmbeddingRecordInput[],
  ): Promise<RawFaceEmbeddingEntity[]> {
    return this.faceEmbeddingsRepository.save(
      inputs.map((input) =>
        this.faceEmbeddingsRepository.create({
          studentId: input.studentId,
          faceImageId: input.faceImageId ?? null,
          enrollmentSessionId: input.enrollmentSessionId ?? null,
          embedding: input.embedding,
          modelName: input.modelName,
          modelVersion: input.modelVersion,
          distanceMetric: input.distanceMetric,
          embeddingDimension: input.embeddingDimension,
          isActive: input.isActive,
          preprocessProfile: input.preprocessProfile,
          isL2Normalized: input.isL2Normalized,
          qualityScore: input.qualityScore ?? null,
          yaw: input.yaw ?? null,
          pitch: input.pitch ?? null,
          roll: input.roll ?? null,
          metadata: input.metadata ?? null,
        }),
      ),
    );
  }

  async deleteEmbeddingsByFaceImageIds(faceImageIds: number[]): Promise<void> {
    if (!faceImageIds.length) {
      return;
    }

    await this.faceEmbeddingsRepository.delete({
      faceImageId: In(faceImageIds),
    });
  }

  async findClosestEmbedding(
    embedding: number[],
    studentIds: number[],
    limit: number = 1,
  ): Promise<ClosestEmbeddingResult[]> {
    if (!studentIds.length) {
      return [];
    }

    const pgVectorArray = `[${embedding.join(',')}]`;

    const results = await this.faceEmbeddingsRepository
      .createQueryBuilder('embedding')
      .select([
        'embedding.studentId AS "studentId"',
        'embedding.id AS "embeddingId"',
      ])
      .addSelect(
        `1 - (embedding.embedding <=> '${pgVectorArray}')`,
        'similarity',
      )
      .where('embedding.studentId IN (:...studentIds)', { studentIds })
      .andWhere('embedding.isActive = :isActive', { isActive: true })
      .orderBy(`embedding.embedding <=> '${pgVectorArray}'`, 'ASC')
      .limit(limit)
      .getRawMany();

    return results.map((row) => ({
      studentId: Number(row.studentId),
      embeddingId: Number(row.embeddingId),
      similarity: Number(row.similarity),
    }));
  }

  async findClosestPrototypeCandidates(
    embedding: number[],
    studentIds: number[],
    limit: number = 10,
  ): Promise<Array<{ studentId: number; similarity: number }>> {
    if (!studentIds.length) {
      return [];
    }

    const pgVectorArray = `[${embedding.join(',')}]`;
    const results = await this.prototypeEmbeddingsRepository
      .createQueryBuilder('prototype')
      .select(['prototype.studentId AS "studentId"'])
      .addSelect(
        `1 - (prototype.embedding <=> '${pgVectorArray}')`,
        'similarity',
      )
      .where('prototype.studentId IN (:...studentIds)', { studentIds })
      .orderBy(`prototype.embedding <=> '${pgVectorArray}'`, 'ASC')
      .limit(limit)
      .getRawMany();

    return results.map((row) => ({
      studentId: Number(row.studentId),
      similarity: Number(row.similarity),
    }));
  }

  async findClosestEnrollmentEmbedding(
    embedding: number[],
    studentIds: number[],
    limit: number = 1,
  ): Promise<ClosestEmbeddingResult[]> {
    return this.findClosestEmbedding(embedding, studentIds, limit);
  }

  private readonly requestRelations = {
    student: {
      role: true,
    },
    reviewedBy: {
      role: true,
    },
    faceImages: {
      file: true,
      alignedFile: true,
      embeddings: true,
      reviewedBy: {
        role: true,
      },
    },
  } as const;

  private readonly faceImageRelations = {
    file: true,
    alignedFile: true,
    reviewedBy: {
      role: true,
    },
  } as const;
}

export const useFacesRepository = () => ({
  provide: REPOSITORY_TOKENS.FACES,
  useFactory: (
    faceRegistrationRequestsRepository: Repository<FaceRegistrationRequestEntity>,
    faceImagesRepository: Repository<FaceImageEntity>,
    faceEmbeddingsRepository: Repository<FaceEmbeddingEntity>,
    prototypeEmbeddingsRepository: Repository<PrototypeEmbeddingEntity>,
  ) =>
    new TypeOrmFacesRepository(
      faceRegistrationRequestsRepository,
      faceImagesRepository,
      faceEmbeddingsRepository,
      prototypeEmbeddingsRepository,
    ),
  inject: [
    getRepositoryToken(FaceRegistrationRequestEntity),
    getRepositoryToken(FaceImageEntity),
    getRepositoryToken(FaceEmbeddingEntity),
    getRepositoryToken(PrototypeEmbeddingEntity),
  ],
});
