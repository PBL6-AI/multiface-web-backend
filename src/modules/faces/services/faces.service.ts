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
import type { AuthenticatedUser } from '../../auth/interfaces';
import { FilesService } from '../../files/services';
import {
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
  ) {}

  async createRequest(
    currentUser: AuthenticatedUser,
  ): Promise<ReturnType<FacesService['serializeRequest']>> {
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

    return this.serializeRequest(request);
  }

  async getLatestRequestForStudent(
    currentUser: AuthenticatedUser,
  ): Promise<ReturnType<FacesService['serializeRequest']>> {
    const request = await this.facesRepository.findLatestRequestByStudentId(
      currentUser.id,
    );

    if (!request) {
      throw new NotFoundException('No face registration request found');
    }

    return this.serializeRequest(request);
  }

  async getRequestByIdForUser(
    requestId: number,
    currentUser: AuthenticatedUser,
  ): Promise<ReturnType<FacesService['serializeRequest']>> {
    const request = await this.findRequestOrThrow(requestId);

    if (currentUser.role !== 'admin' && request.studentId !== currentUser.id) {
      throw new ForbiddenException(
        'You do not have permission to access this face registration request',
      );
    }

    return this.serializeRequest(request);
  }

  async listRequests(
    query: ListFaceRegistrationRequestsQueryDto,
  ): Promise<ReturnType<FacesService['serializeRequest']>[]> {
    const requests = await this.facesRepository.listRequests({
      status: query.status,
    });

    return requests.map((request) => this.serializeRequest(request));
  }

  async uploadRequestImage(
    requestId: number,
    currentUser: AuthenticatedUser,
    file: UploadableFile,
    uploadFaceRegistrationImageDto: UploadFaceRegistrationImageDto,
  ): Promise<ReturnType<FacesService['serializeRequest']>> {
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

    return this.serializeRequest(updatedRequest);
  }

  async reviewRequest(
    requestId: number,
    reviewer: AuthenticatedUser,
    reviewFaceRegistrationRequestDto: ReviewFaceRegistrationRequestDto,
  ): Promise<ReturnType<FacesService['serializeRequest']>> {
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

    const reviewedImages = request.faceImages.map((image) => ({
      ...image,
      status: reviewFaceRegistrationRequestDto.status,
      reviewedById: reviewer.id,
      reviewedAt,
      rejectionReason:
        reviewFaceRegistrationRequestDto.status === ApprovalStatus.REJECTED
          ? rejectionReason
          : null,
    }));

    await this.facesRepository.saveImages(reviewedImages);

    const updatedRequest = await this.facesRepository.saveRequest(request);

    return this.serializeRequest(updatedRequest);
  }

  serializeRequest(request: RawFaceRegistrationRequestEntity) {
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
      completedPoses,
      missingPoses,
      images: sortedImages.map((image) => this.serializeImage(image)),
    };
  }

  private serializeImage(image: RawFaceImageEntity) {
    return {
      id: image.id,
      pose: image.pose,
      status: image.status,
      captureSource: image.captureSource,
      capturedAt: image.capturedAt,
      qualityScore: image.qualityScore,
      createdAt: image.createdAt,
      file: this.filesService.serializeUploadedFile(image.file),
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
}
