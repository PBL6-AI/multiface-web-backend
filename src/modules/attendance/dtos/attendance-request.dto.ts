import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  AttendanceSessionStatus,
  AttendanceType,
} from '../../../common/domain/enums';

export class CreateAttendanceSessionDto {
  @ApiProperty({
    description: 'Class identifier that the attendance session belongs to',
    example: 12,
  })
  @IsNumber()
  classId: number;

  @ApiPropertyOptional({
    description: 'Optional custom start time for the session',
    example: '2026-04-19T09:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({
    description: 'Attendance session mode',
    enum: AttendanceType,
    example: AttendanceType.AUTOMATIC,
  })
  @IsOptional()
  @IsEnum(AttendanceType)
  attendanceType?: AttendanceType;

  @ApiPropertyOptional({
    description: 'Confidence threshold used to accept recognition events',
    example: 0.8,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceThreshold?: number;
}

export class IngestRecognitionEventDto {
  @ApiProperty({
    description: 'Identifier of the edge device that produced the event',
    example: 'pi-main-01',
  })
  @IsString()
  sourceDeviceId: string;

  @ApiProperty({
    description: 'Frame identifier from the edge device or AI service',
    example: 'frame-1713510900-001',
  })
  @IsString()
  frameId: string;

  @ApiPropertyOptional({
    description: 'Optional snapshot file id stored in the file service',
    example: 502,
  })
  @IsOptional()
  @IsNumber()
  imageFileId?: number;

  @ApiPropertyOptional({
    description: 'Candidate user id identified by the AI service',
    example: 42,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  candidateUserId?: number | null;

  @ApiPropertyOptional({
    description: 'Matched face embedding identifier returned by the AI service',
    example: 301,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  matchedEmbeddingId?: number | null;

  @ApiPropertyOptional({
    description: 'Confidence score returned by the AI service',
    example: 0.92,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceScore?: number | null;

  @ApiPropertyOptional({
    description: 'Similarity score returned by the AI service',
    example: 0.81,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  similarityScore?: number | null;

  @ApiPropertyOptional({
    description: 'Whether anti-spoofing determined the face is real',
    example: true,
    default: true,
  })
  @IsOptional()
  isRealFace?: boolean;

  @ApiPropertyOptional({
    description: 'Anti-spoofing confidence score',
    example: 0.97,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  antiSpoofingScore?: number | null;

  @ApiPropertyOptional({
    description: 'Object containing face bounding box coordinates',
    example: { x: 120, y: 80, width: 160, height: 160 },
  })
  @IsOptional()
  @IsObject()
  boundingBox?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    description: 'Detector model used by the AI service',
    example: 'scrfd_500m',
  })
  @IsOptional()
  @IsString()
  detectorModel?: string;

  @ApiPropertyOptional({
    description: 'Detector model version',
    example: '1',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  detectorModelVersion?: string | null;

  @ApiPropertyOptional({
    description: 'Recognition model used by the AI service',
    example: 'edgeface_xxs',
  })
  @IsOptional()
  @IsString()
  recognitionModel?: string;

  @ApiPropertyOptional({
    description: 'Recognition model version',
    example: '1',
  })
  @IsOptional()
  @IsString()
  recognitionModelVersion?: string;

  @ApiPropertyOptional({
    description: 'Anti-spoofing model name',
    example: 'silent-fas',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  antiSpoofingModel?: string | null;

  @ApiPropertyOptional({
    description: 'Anti-spoofing model version',
    example: '1',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  antiSpoofingModelVersion?: string | null;

  @ApiPropertyOptional({
    description: 'Additional metadata from the edge device or AI service',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class ListAttendanceSessionsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter sessions by status',
    enum: AttendanceSessionStatus,
    example: AttendanceSessionStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(AttendanceSessionStatus)
  status?: AttendanceSessionStatus;
}
