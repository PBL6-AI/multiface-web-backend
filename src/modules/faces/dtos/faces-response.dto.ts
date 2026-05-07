import { ApiProperty } from '@nestjs/swagger';
import {
  FaceImagePose,
  FaceRegistrationEmbeddingStatus,
  FaceRegistrationSessionStatus,
} from '../../../common/domain/enums';
import { UploadedFileResponseDto } from '../../files/dtos';

class FaceSampleCountByPoseDto {
  @ApiProperty({ example: 20 })
  front: number;

  @ApiProperty({ example: 20 })
  left: number;

  @ApiProperty({ example: 20 })
  right: number;

  @ApiProperty({ example: 20 })
  up: number;

  @ApiProperty({ example: 20 })
  down: number;
}

export class FaceRegistrationSampleResponseDto {
  @ApiProperty({ example: 501 })
  id: number;

  @ApiProperty({ enum: FaceImagePose, example: FaceImagePose.FRONT })
  pose: FaceImagePose;

  @ApiProperty({ example: 'web_realtime_ai_registration' })
  captureSource: string;

  @ApiProperty({ nullable: true, example: '2026-05-07T15:03:21.000Z' })
  capturedAt: Date | null;

  @ApiProperty({ nullable: true, example: 0.87 })
  qualityScore: number | null;

  @ApiProperty({ example: '2026-05-07T15:03:22.000Z' })
  createdAt: Date;

  @ApiProperty({ type: UploadedFileResponseDto })
  rawFile: UploadedFileResponseDto;

  @ApiProperty({
    type: UploadedFileResponseDto,
    nullable: true,
    required: false,
  })
  alignedFile: UploadedFileResponseDto | null;

  @ApiProperty({ nullable: true, type: Object })
  metadata: Record<string, unknown> | null;
}

export class FaceRegistrationSessionResponseDto {
  @ApiProperty({ example: 101 })
  id: number;

  @ApiProperty({ example: 12 })
  studentId: number;

  @ApiProperty({
    enum: FaceRegistrationSessionStatus,
    example: FaceRegistrationSessionStatus.COLLECTING,
  })
  status: FaceRegistrationSessionStatus;

  @ApiProperty({
    enum: FaceRegistrationEmbeddingStatus,
    example: FaceRegistrationEmbeddingStatus.NOT_STARTED,
  })
  embeddingStatus: FaceRegistrationEmbeddingStatus;

  @ApiProperty({
    enum: FaceImagePose,
    nullable: true,
    example: FaceImagePose.LEFT,
  })
  currentPose: FaceImagePose | null;

  @ApiProperty({ example: 20 })
  targetCountPerPose: number;

  @ApiProperty({ example: 100 })
  requiredTotalSamples: number;

  @ApiProperty({ example: 67 })
  totalAcceptedSamples: number;

  @ApiProperty({ type: FaceSampleCountByPoseDto })
  sampleCountByPose: Record<FaceImagePose, number>;

  @ApiProperty({ example: '2026-05-07T15:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-05-07T15:05:00.000Z', nullable: true })
  completedAt: Date | null;

  @ApiProperty({ example: '2026-05-07T15:05:03.000Z' })
  updatedAt: Date;

  @ApiProperty({
    type: FaceRegistrationSampleResponseDto,
    isArray: true,
  })
  samples: FaceRegistrationSampleResponseDto[];

  @ApiProperty({ nullable: true, type: Object })
  metadata: Record<string, unknown> | null;
}

export class FaceRegistrationEmbeddingsBuildResponseDto {
  @ApiProperty({ example: 101 })
  sessionId: number;

  @ApiProperty({ example: 100 })
  requestedSampleCount: number;

  @ApiProperty({ example: 56 })
  generatedEmbeddingCount: number;

  @ApiProperty({
    enum: FaceRegistrationSessionStatus,
    example: FaceRegistrationSessionStatus.EMBEDDING_COMPLETED,
  })
  status: FaceRegistrationSessionStatus;

  @ApiProperty({
    enum: FaceRegistrationEmbeddingStatus,
    example: FaceRegistrationEmbeddingStatus.COMPLETED,
  })
  embeddingStatus: FaceRegistrationEmbeddingStatus;
}
