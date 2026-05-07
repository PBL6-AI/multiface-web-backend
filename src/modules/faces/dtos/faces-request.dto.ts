import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FaceImagePose } from '../../../common/domain/enums';

export class UploadFaceRegistrationSampleDto {
  @ApiProperty({
    enum: FaceImagePose,
    example: FaceImagePose.FRONT,
  })
  @IsEnum(FaceImagePose)
  pose: FaceImagePose;

  @ApiPropertyOptional({
    example: 'web_realtime_ai_registration',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  captureSource?: string;

  @ApiPropertyOptional({
    example: '2026-05-07T15:03:21.000Z',
  })
  @IsOptional()
  @IsDateString()
  capturedAt?: string;

  @ApiPropertyOptional({
    example: 0.87,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  qualityScore?: number;

  @ApiPropertyOptional({
    example: 0.96,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  detectionScore?: number;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  faceCount?: number;

  @ApiPropertyOptional({
    example: FaceImagePose.FRONT,
    enum: FaceImagePose,
  })
  @IsOptional()
  @IsEnum(FaceImagePose)
  estimatedPose?: FaceImagePose;

  @ApiPropertyOptional({
    description: 'Optional JSON string containing bbox information',
  })
  @IsOptional()
  @IsString()
  bbox?: string;

  @ApiPropertyOptional({
    description: 'Optional JSON string containing landmark list',
  })
  @IsOptional()
  @IsString()
  landmarks?: string;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  aiValidated?: boolean;

  @ApiPropertyOptional({
    description:
      'Optional aligned face image returned by AI as a base64 data URL',
  })
  @IsOptional()
  @IsString()
  alignedImageBase64?: string;

  @ApiPropertyOptional({
    description: 'Optional additional AI metadata for audit/debug',
  })
  @IsOptional()
  @IsString()
  aiMetadata?: string;
}

export class CreateFaceRegistrationSessionDto {
  @ApiPropertyOptional({
    description: 'Override samples required for each pose',
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  targetCountPerPose?: number;
}

export class BuildFaceRegistrationEmbeddingsDto {
  @ApiPropertyOptional({
    description:
      'Whether to delete and regenerate previous embeddings for this session',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  replaceExisting?: boolean;
}
