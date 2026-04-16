import { getRepositoryToken } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../../common/constants';
import { ApprovalStatus, FaceImagePose } from '../../../common/domain/enums';
import { Repository } from 'typeorm';
import type {
  CreateFaceImageRecordInput,
  CreateFaceRegistrationRequestRecordInput,
  FacesRepository,
  ListFaceRegistrationRequestsOptions,
  RawFaceImageEntity,
  RawFaceRegistrationRequestEntity,
} from '../../domain';
import { FaceImageEntity, FaceRegistrationRequestEntity } from '../entities';

export class TypeOrmFacesRepository implements FacesRepository {
  constructor(
    private readonly faceRegistrationRequestsRepository: Repository<FaceRegistrationRequestEntity>,
    private readonly faceImagesRepository: Repository<FaceImageEntity>,
  ) {}

  async findRequestById(
    requestId: number,
  ): Promise<RawFaceRegistrationRequestEntity | null> {
    return this.faceRegistrationRequestsRepository.findOne({
      where: { id: requestId },
      relations: this.requestRelations,
    });
  }

  async findLatestRequestByStudentId(
    studentId: number,
  ): Promise<RawFaceRegistrationRequestEntity | null> {
    return this.faceRegistrationRequestsRepository.findOne({
      where: { studentId },
      relations: this.requestRelations,
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingRequestByStudentId(
    studentId: number,
  ): Promise<RawFaceRegistrationRequestEntity | null> {
    return this.faceRegistrationRequestsRepository.findOne({
      where: {
        studentId,
        status: ApprovalStatus.PENDING,
      },
      relations: this.requestRelations,
      order: { createdAt: 'DESC' },
    });
  }

  async createRequest(
    input: CreateFaceRegistrationRequestRecordInput,
  ): Promise<RawFaceRegistrationRequestEntity> {
    const savedRequest = await this.faceRegistrationRequestsRepository.save(
      this.faceRegistrationRequestsRepository.create({
        studentId: input.studentId,
        status: input.status ?? ApprovalStatus.PENDING,
      }),
    );

    const request = await this.findRequestById(savedRequest.id);

    if (!request) {
      throw new Error('Face registration request was created but not reloaded');
    }

    return request;
  }

  async createFaceImage(
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

  async findRequestImageByPose(
    requestId: number,
    pose: FaceImagePose,
  ): Promise<RawFaceImageEntity | null> {
    return this.faceImagesRepository.findOne({
      where: { requestId, pose },
      relations: this.faceImageRelations,
    });
  }

  async countRequestImages(requestId: number): Promise<number> {
    return this.faceImagesRepository.count({
      where: { requestId },
    });
  }

  async listRequests(
    options?: ListFaceRegistrationRequestsOptions,
  ): Promise<RawFaceRegistrationRequestEntity[]> {
    const where = {
      ...(options?.studentId ? { studentId: options.studentId } : {}),
      ...(options?.status ? { status: options.status } : {}),
    };

    return this.faceRegistrationRequestsRepository.find({
      where,
      relations: this.requestRelations,
      order: { createdAt: 'DESC' },
    });
  }

  async saveRequest(
    request: RawFaceRegistrationRequestEntity,
  ): Promise<RawFaceRegistrationRequestEntity> {
    const savedRequest =
      await this.faceRegistrationRequestsRepository.save(request);
    const reloadedRequest = await this.findRequestById(savedRequest.id);

    if (!reloadedRequest) {
      throw new Error('Face registration request was saved but not reloaded');
    }

    return reloadedRequest;
  }

  async saveImages(
    images: RawFaceImageEntity[],
  ): Promise<RawFaceImageEntity[]> {
    return this.faceImagesRepository.save(images);
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
  ) =>
    new TypeOrmFacesRepository(
      faceRegistrationRequestsRepository,
      faceImagesRepository,
    ),
  inject: [
    getRepositoryToken(FaceRegistrationRequestEntity),
    getRepositoryToken(FaceImageEntity),
  ],
});
