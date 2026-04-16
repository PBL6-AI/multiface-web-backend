import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApprovalStatus, FaceImagePose } from '../../../common/domain/enums';

export class UploadFaceRegistrationImageDto {
  @ApiProperty({
    description: 'Pose of the face image being uploaded',
    enum: FaceImagePose,
    example: FaceImagePose.FRONT,
  })
  @IsEnum(FaceImagePose)
  pose: FaceImagePose;

  @ApiPropertyOptional({
    description: 'Optional checksum for the uploaded face image',
    example: 'sha256:front-image-hash',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  checksum?: string;

  @ApiPropertyOptional({
    description: 'Client-side capture source label',
    example: 'web_registration',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  captureSource?: string;

  @ApiPropertyOptional({
    description: 'Timestamp when the frame was captured on the client',
    example: '2026-04-16T14:10:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  capturedAt?: string;

  @ApiPropertyOptional({
    description:
      'Optional quality score from the client, normalized from 0 to 1',
    example: 0.91,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  qualityScore?: number;
}

export class ListFaceRegistrationRequestsQueryDto {
  @ApiPropertyOptional({
    description: 'Optional filter by review status',
    enum: ApprovalStatus,
    example: ApprovalStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;
}

export class ReviewFaceRegistrationRequestDto {
  @ApiProperty({
    description: 'Review outcome for the registration request',
    enum: [ApprovalStatus.APPROVED, ApprovalStatus.REJECTED],
    example: ApprovalStatus.APPROVED,
  })
  @IsIn([ApprovalStatus.APPROVED, ApprovalStatus.REJECTED])
  status: ApprovalStatus.APPROVED | ApprovalStatus.REJECTED;

  @ApiPropertyOptional({
    description: 'Reason for rejection when the request is rejected',
    example: 'Left pose is blurry, please retake all 5 images.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  rejectionReason?: string;
}
