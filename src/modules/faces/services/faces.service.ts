import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../common/constants';
import { ApprovalStatus, FaceImagePose } from '../../../common/domain/enums';
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
  FaceRegistrationRequestResponseDto,
  ListFaceRegistrationRequestsQueryDto,
  ReviewFaceRegistrationRequestDto,
  UploadFaceRegistrationImageDto,
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

  async createRequest(
    currentUser: AuthenticatedUser,
  ): Promise<FaceRegistrationRequestResponseDto> {
    const existingPendingRequest =
      await this.facesRepository.findPendingRequestByStudentId(currentUser.id);

    if (existingPendingRequest) {
      throw new ConflictException(
        'A pending face registration request already exists for this student',
      );
    }

    const request = await this.facesRepository.createRequest({
      studentId: currentUser.id,
    });

    return await this.serializeRequest(request);
  }

  async getLatestRequestForStudent(
    currentUser: AuthenticatedUser,
  ): Promise<FaceRegistrationRequestResponseDto> {
    const request = await this.facesRepository.findLatestRequestByStudentId(
      currentUser.id,
    );

    if (!request) {
      throw new NotFoundException('No face registration request found');
    }

    return await this.serializeRequest(request);
  }

  async getRequestByIdForUser(
    requestId: number,
    currentUser: AuthenticatedUser,
  ): Promise<FaceRegistrationRequestResponseDto> {
    const request = await this.findRequestOrThrow(requestId);

    if (currentUser.role !== 'admin' && request.studentId !== currentUser.id) {
      throw new ForbiddenException(
        'You do not have permission to access this face registration request',
      );
    }

    return await this.serializeRequest(request);
  }

  async listRequests(
    query: ListFaceRegistrationRequestsQueryDto,
  ): Promise<FaceRegistrationRequestResponseDto[]> {
    const requests = await this.facesRepository.listRequests({
      status: query.status,
    });

    return Promise.all(
      requests.map((request) => this.serializeRequest(request)),
    );
  }

  async uploadRequestImage(
    requestId: number,
    currentUser: AuthenticatedUser,
    file: UploadableFile,
    uploadFaceRegistrationImageDto: UploadFaceRegistrationImageDto,
  ): Promise<FaceRegistrationRequestResponseDto> {
    if (!file.buffer.length) {
      throw new BadRequestException('Uploaded image cannot be empty');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Uploaded file must be an image');
    }

    const request = await this.findRequestOrThrow(requestId);

    if (request.studentId !== currentUser.id) {
      throw new ForbiddenException(
        'You can only upload face images to your own registration request',
      );
    }

    if (request.status !== ApprovalStatus.PENDING) {
      throw new ConflictException(
        'Only pending face registration requests can receive new images',
      );
    }

    const existingPoseImage = await this.facesRepository.findRequestImageByPose(
      requestId,
      uploadFaceRegistrationImageDto.pose,
    );

    if (existingPoseImage) {
      throw new ConflictException(
        `Pose "${uploadFaceRegistrationImageDto.pose}" has already been uploaded for this request`,
      );
    }

    const currentImageCount =
      await this.facesRepository.countRequestImages(requestId);

    if (currentImageCount >= FACE_REGISTRATION_REQUIRED_POSES.length) {
      throw new ConflictException(
        'This face registration request already has enough images',
      );
    }

    const storedFile = await this.filesService.storeUploadedFile({
      uploaderId: currentUser.id,
      file,
      category: `face_registration_raw/${uploadFaceRegistrationImageDto.pose}`,
      checksum: uploadFaceRegistrationImageDto.checksum ?? null,
    });

    await this.facesRepository.createFaceImage({
      studentId: currentUser.id,
      requestId,
      fileId: storedFile.id,
      pose: uploadFaceRegistrationImageDto.pose,
      captureSource:
        uploadFaceRegistrationImageDto.captureSource ?? 'web_registration',
      qualityScore: uploadFaceRegistrationImageDto.qualityScore ?? null,
      capturedAt: uploadFaceRegistrationImageDto.capturedAt
        ? new Date(uploadFaceRegistrationImageDto.capturedAt)
        : new Date(),
      metadata: {
        registrationFlow: 'five_pose_capture',
        pose: uploadFaceRegistrationImageDto.pose,
      },
    });

    const updatedRequest = await this.findRequestOrThrow(requestId);

    return await this.serializeRequest(updatedRequest);
  }

  async reviewRequest(
    requestId: number,
    reviewer: AuthenticatedUser,
    reviewFaceRegistrationRequestDto: ReviewFaceRegistrationRequestDto,
  ): Promise<FaceRegistrationRequestResponseDto> {
    const request = await this.findRequestOrThrow(requestId);

    if (request.status !== ApprovalStatus.PENDING) {
      throw new ConflictException(
        'Only pending face registration requests can be reviewed',
      );
    }

    if (
      reviewFaceRegistrationRequestDto.status === ApprovalStatus.APPROVED &&
      request.faceImages.length !== FACE_REGISTRATION_REQUIRED_POSES.length
    ) {
      throw new BadRequestException(
        `An approved face registration request must contain exactly ${FACE_REGISTRATION_REQUIRED_POSES.length} images`,
      );
    }

    const rejectionReason =
      reviewFaceRegistrationRequestDto.rejectionReason?.trim() || null;

    if (
      reviewFaceRegistrationRequestDto.status === ApprovalStatus.REJECTED &&
      !rejectionReason
    ) {
      throw new BadRequestException(
        'A rejection reason is required when rejecting a face registration request',
      );
    }

    const reviewedAt = new Date();

    request.status = reviewFaceRegistrationRequestDto.status;
    request.reviewedById = reviewer.id;
    request.reviewedAt = reviewedAt;
    request.rejectionReason =
      reviewFaceRegistrationRequestDto.status === ApprovalStatus.REJECTED
        ? rejectionReason
        : null;

    for (const image of request.faceImages) {
      image.status = reviewFaceRegistrationRequestDto.status;
      image.reviewedById = reviewer.id;
      image.reviewedAt = reviewedAt;
      image.rejectionReason =
        reviewFaceRegistrationRequestDto.status === ApprovalStatus.REJECTED
          ? rejectionReason
          : null;

      if (reviewFaceRegistrationRequestDto.status === ApprovalStatus.APPROVED) {
        image.metadata = this.withEmbeddingMetadata(image, {
          status: 'queued',
          updatedAt: reviewedAt.toISOString(),
        });
      }
    }

    await this.facesRepository.saveImages(request.faceImages);

    await this.facesRepository.saveRequest(request);

    if (reviewFaceRegistrationRequestDto.status === ApprovalStatus.APPROVED) {
      await this.processEmbeddingsForApprovedRequest(request.id);
    }

    const updatedRequest = await this.findRequestOrThrow(requestId);

    return await this.serializeRequest(updatedRequest);
  }

  async serializeRequest(
    request: RawFaceRegistrationRequestEntity,
  ): Promise<FaceRegistrationRequestResponseDto> {
    const sortedImages = [...request.faceImages].sort((left, right) => {
      const poseOrderDifference =
        this.poseOrder(left.pose) - this.poseOrder(right.pose);

      if (poseOrderDifference !== 0) {
        return poseOrderDifference;
      }

      return left.createdAt.getTime() - right.createdAt.getTime();
    });

    const completedPoses = sortedImages.map((image) => image.pose);
    const missingPoses = FACE_REGISTRATION_REQUIRED_POSES.filter(
      (pose) => !completedPoses.includes(pose),
    );
    const approvedImages = sortedImages.filter(
      (image) => image.status === ApprovalStatus.APPROVED,
    );
    const embeddedImages = approvedImages.filter(
      (image) => (image.embeddings?.length ?? 0) > 0,
    );

    return {
      id: request.id,
      studentId: request.studentId,
      status: request.status,
      reviewedById: request.reviewedById,
      reviewedAt: request.reviewedAt,
      rejectionReason: request.rejectionReason,
      createdAt: request.createdAt,
      uploadedPoseCount: sortedImages.length,
      requiredPoseCount: FACE_REGISTRATION_REQUIRED_POSES.length,
      embeddedPoseCount: embeddedImages.length,
      requiredEmbeddingCount: FACE_REGISTRATION_REQUIRED_POSES.length,
      embeddingStatus: this.resolveRequestEmbeddingStatus(
        request,
        approvedImages,
      ),
      completedPoses,
      missingPoses,
      images: await Promise.all(
        sortedImages.map((image) => this.serializeImage(image)),
      ),
    };
  }

  private async serializeImage(image: RawFaceImageEntity) {
    return {
      id: image.id,
      pose: image.pose,
      status: image.status,
      captureSource: image.captureSource,
      capturedAt: image.capturedAt,
      qualityScore: image.qualityScore,
      createdAt: image.createdAt,
      embeddingStatus: this.resolveImageEmbeddingStatus(image),
      file: await this.filesService.serializeUploadedFileWithSignedUrl(
        image.file,
      ),
    };
  }

  private async findRequestOrThrow(
    requestId: number,
  ): Promise<RawFaceRegistrationRequestEntity> {
    const request = await this.facesRepository.findRequestById(requestId);

    if (!request) {
      throw new NotFoundException('Face registration request not found');
    }

    return request;
  }

  private poseOrder(pose: FaceImagePose): number {
    return FACE_REGISTRATION_REQUIRED_POSES.indexOf(pose);
  }

  private async processEmbeddingsForApprovedRequest(
    requestId: number,
  ): Promise<void> {
    const request = await this.findRequestOrThrow(requestId);
    const approvedImages = request.faceImages.filter(
      (image) => image.status === ApprovalStatus.APPROVED,
    );

    if (!approvedImages.length) {
      return;
    }

    try {
      const result = await this.aiProvider.generateFaceEmbeddings({
        requestId: request.id,
        studentId: request.studentId,
        images: await Promise.all(
          approvedImages.map(async (image) => {
            const serialized =
              await this.filesService.serializeUploadedFileWithSignedUrl(
                image.file,
              );
            return {
              faceImageId: image.id,
              url: serialized.url,
              pose: image.pose,
            };
          }),
        ),
      });

      await this.facesRepository.deleteEmbeddingsByFaceImageIds(
        approvedImages.map((image) => image.id),
      );
      await this.facesRepository.createEmbeddings(
        result.embeddings.map((embedding) => ({
          studentId: request.studentId,
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

      for (const image of approvedImages) {
        // Clear stale embeddings relation in memory to prevent TypeORM from
        // trying to update/nullify them after they were deleted from DB.
        image.embeddings = [];

        const embedding = result.embeddings.find(
          (item) => item.faceImageId === image.id,
        );

        image.metadata = this.withEmbeddingMetadata(image, {
          status: embedding ? 'completed' : 'failed',
          updatedAt: new Date().toISOString(),
          modelName: embedding?.modelName ?? null,
          modelVersion: embedding?.modelVersion ?? null,
        });
      }

      await this.facesRepository.saveImages(approvedImages);
    } catch (error) {
      for (const image of approvedImages) {
        image.embeddings = []; // Safety clear here too
        image.metadata = this.withEmbeddingMetadata(image, {
          status: 'failed',
          updatedAt: new Date().toISOString(),
          reason:
            error instanceof Error
              ? error.message
              : 'Unknown embedding generation error',
        });
      }

      await this.facesRepository.saveImages(approvedImages);
    }
  }

  private resolveRequestEmbeddingStatus(
    request: RawFaceRegistrationRequestEntity,
    approvedImages: RawFaceImageEntity[],
  ): string {
    if (request.status === ApprovalStatus.REJECTED) {
      return 'not_available';
    }

    if (request.status !== ApprovalStatus.APPROVED) {
      return 'not_requested';
    }

    if (!approvedImages.length) {
      return 'queued';
    }

    const statuses = approvedImages.map((image) =>
      this.resolveImageEmbeddingStatus(image),
    );

    if (statuses.every((status) => status === 'completed')) {
      return 'completed';
    }

    if (statuses.some((status) => status === 'failed')) {
      return 'partial_failed';
    }

    if (statuses.some((status) => status === 'completed')) {
      return 'processing';
    }

    return 'queued';
  }

  private resolveImageEmbeddingStatus(image: RawFaceImageEntity): string {
    if ((image.embeddings?.length ?? 0) > 0) {
      return 'completed';
    }

    const metadata = image.metadata;
    const embeddingMetadata =
      metadata && typeof metadata === 'object' && 'embedding' in metadata
        ? metadata.embedding
        : null;

    if (embeddingMetadata && typeof embeddingMetadata === 'object') {
      const status =
        'status' in embeddingMetadata ? embeddingMetadata.status : null;

      if (typeof status === 'string') {
        return status;
      }
    }

    return image.status === ApprovalStatus.APPROVED
      ? 'queued'
      : 'not_requested';
  }

  private withEmbeddingMetadata(
    image: RawFaceImageEntity,
    payload: Record<string, unknown>,
  ): Record<string, unknown> {
    const existingMetadata =
      image.metadata && typeof image.metadata === 'object'
        ? image.metadata
        : {};
    const existingEmbeddingMetadata =
      'embedding' in existingMetadata &&
      existingMetadata.embedding &&
      typeof existingMetadata.embedding === 'object'
        ? (existingMetadata.embedding as Record<string, unknown>)
        : {};

    return {
      ...existingMetadata,
      embedding: {
        ...existingEmbeddingMetadata,
        ...payload,
      },
    };
  }
}
