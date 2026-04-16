import { ApiProperty } from '@nestjs/swagger';
import { ApprovalStatus, FaceImagePose } from '../../../common/domain/enums';
import { UploadedFileResponseDto } from '../../files/dtos';

export class FaceRegistrationImageResponseDto {
  @ApiProperty({
    description: 'Face image record identifier',
    example: 501,
  })
  id: number;

  @ApiProperty({
    description: 'Pose label associated with the uploaded face image',
    enum: FaceImagePose,
    example: FaceImagePose.LEFT,
  })
  pose: FaceImagePose;

  @ApiProperty({
    description: 'Review status of the face image',
    enum: ApprovalStatus,
    example: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @ApiProperty({
    description: 'Source label used when the face image was captured',
    example: 'web_registration',
  })
  captureSource: string;

  @ApiProperty({
    description: 'Captured timestamp, if provided by the client',
    nullable: true,
    example: '2026-04-16T14:10:00.000Z',
  })
  capturedAt: Date | null;

  @ApiProperty({
    description: 'Quality score provided during upload',
    nullable: true,
    example: 0.91,
  })
  qualityScore: number | null;

  @ApiProperty({
    description: 'Face image record creation timestamp',
    example: '2026-04-16T14:10:01.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Uploaded raw file metadata for this face image',
    type: UploadedFileResponseDto,
  })
  file: UploadedFileResponseDto;
}

export class FaceRegistrationRequestResponseDto {
  @ApiProperty({
    description: 'Face registration request identifier',
    example: 101,
  })
  id: number;

  @ApiProperty({
    description: 'Student identifier that owns this request',
    example: 12,
  })
  studentId: number;

  @ApiProperty({
    description: 'Current review status of the request',
    enum: ApprovalStatus,
    example: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @ApiProperty({
    description: 'Reviewer identifier when the request has been reviewed',
    nullable: true,
    example: 2,
  })
  reviewedById: number | null;

  @ApiProperty({
    description: 'Time when the request was reviewed',
    nullable: true,
    example: '2026-04-16T14:30:00.000Z',
  })
  reviewedAt: Date | null;

  @ApiProperty({
    description: 'Reason provided when the request was rejected',
    nullable: true,
    example: 'Down pose was too dark, please retry.',
  })
  rejectionReason: string | null;

  @ApiProperty({
    description: 'Creation timestamp of the request',
    example: '2026-04-16T14:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Number of poses uploaded for the request',
    example: 3,
  })
  uploadedPoseCount: number;

  @ApiProperty({
    description: 'Number of poses required to complete registration',
    example: 5,
  })
  requiredPoseCount: number;

  @ApiProperty({
    description: 'Poses that have already been uploaded',
    enum: FaceImagePose,
    isArray: true,
    example: [FaceImagePose.FRONT, FaceImagePose.LEFT, FaceImagePose.RIGHT],
  })
  completedPoses: FaceImagePose[];

  @ApiProperty({
    description: 'Poses still missing from the request',
    enum: FaceImagePose,
    isArray: true,
    example: [FaceImagePose.UP, FaceImagePose.DOWN],
  })
  missingPoses: FaceImagePose[];

  @ApiProperty({
    description: 'Uploaded images that belong to the request',
    type: FaceRegistrationImageResponseDto,
    isArray: true,
  })
  images: FaceRegistrationImageResponseDto[];
}
