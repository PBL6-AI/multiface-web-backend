import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNumber, IsString } from 'class-validator';

export class VerifyAttendanceRequestDto {
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

  @ApiProperty({
    description: 'Timestamp when the frame was processed',
    example: '2026-04-29T12:07:37.959Z',
  })
  @IsDateString()
  timestamp: string;
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
