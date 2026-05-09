import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class VerifyAttendanceRequestDto {
  @ApiProperty({
    description: 'Attendance session identifier to verify against',
    example: 91,
  })
  @IsNumber()
  sessionId: number;

  @ApiProperty({
    description: 'Face embedding vector from AI service',
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  embedding: number[];

  @ApiProperty({
    description: 'Camera identifier where the face was captured',
    example: 'CAM_01',
  })
  @IsString()
  cameraId: string;

  @ApiPropertyOptional({
    description: 'Edge device identifier that produced the request',
    example: 'pi-room-a-01',
  })
  @IsOptional()
  @IsString()
  sourceDeviceId?: string;

  @ApiProperty({
    description: 'Track identifier from the tracker (e.g. SORT)',
    example: 42,
  })
  @IsNumber()
  trackId: number;

  @ApiProperty({
    description: 'Detection score (confidence)',
    example: 0.98,
  })
  @IsNumber()
  detectionScore: number;

  @ApiPropertyOptional({
    description: 'Anti-spoofing confidence score',
    example: 0.98,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  antiSpoofingScore?: number;

  @ApiProperty({
    description: 'Timestamp when the frame was processed',
    example: '2026-04-29T12:07:37.959Z',
  })
  @IsDateString()
  timestamp: string;

  @ApiPropertyOptional({
    description: 'Additional verification metadata from the edge pipeline',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class VerifyAttendanceResponseDto {
  @ApiProperty({
    description: 'Match status',
    example: 'MATCH',
    enum: ['MATCH', 'NO_MATCH'],
  })
  status: 'MATCH' | 'NO_MATCH';

  @ApiPropertyOptional({
    description: 'Matched user ID',
    example: 42,
  })
  userId?: number;

  @ApiPropertyOptional({
    description: 'Matched user name',
    example: 'John Doe',
  })
  userName?: string;

  @ApiPropertyOptional({
    description: 'Cosine similarity score',
    example: 0.92,
  })
  similarity?: number;

  @ApiPropertyOptional({
    description: 'Response message',
  })
  message?: string;
}
