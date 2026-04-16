import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class TestUploadFileDto {
  @ApiPropertyOptional({
    description: 'Optional file category stored in the files table',
    example: 'face_registration_raw',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9_/-]+$/)
  category?: string;

  @ApiPropertyOptional({
    description: 'Optional checksum for the uploaded file',
    example: 'sha256:abc123',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  checksum?: string;
}
