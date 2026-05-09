import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, Max } from 'class-validator';
import { EnrollmentSessionStatus } from '../../../common/domain/enums';

export class CreateEnrollmentSessionDto {
  @ApiProperty({ example: 'enrollment.webm' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ example: 'video/webm' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({ example: 7340032 })
  @IsInt()
  @IsPositive()
  @Max(50 * 1024 * 1024)
  fileSize: number;
}

export class CompleteEnrollmentSessionDto {
  @ApiProperty({ example: 101 })
  @IsInt()
  @IsPositive()
  sessionId: number;
}

export class EnrollmentVideoUploadDto {
  @ApiProperty()
  objectKey: string;

  @ApiProperty()
  uploadUrl: string;

  @ApiProperty()
  expiresInSeconds: number;
}

export class EnrollmentSessionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  studentId: number;

  @ApiProperty({ enum: EnrollmentSessionStatus })
  status: EnrollmentSessionStatus;

  @ApiProperty()
  videoFilename: string;

  @ApiProperty()
  videoMimeType: string;

  @ApiPropertyOptional()
  videoSize: number | null;

  @ApiPropertyOptional()
  videoUrl: string | null;

  @ApiProperty()
  videoObjectKey: string;

  @ApiPropertyOptional({ type: EnrollmentVideoUploadDto })
  upload: EnrollmentVideoUploadDto | null;

  @ApiProperty()
  embeddingCount: number;

  @ApiProperty()
  prototypeReady: boolean;

  @ApiProperty()
  registrationLocked: boolean;

  @ApiPropertyOptional()
  registrationLockReason: string | null;

  @ApiPropertyOptional()
  failureReason: string | null;

  @ApiPropertyOptional({ type: Object })
  processingSummary: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: Object })
  metadata: Record<string, unknown> | null;

  @ApiPropertyOptional()
  jobId: string | null;

  @ApiPropertyOptional()
  processingStartedAt: Date | null;

  @ApiPropertyOptional()
  processingCompletedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
