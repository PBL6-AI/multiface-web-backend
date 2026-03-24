import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProcessRecognitionDto {
  @IsNumber()
  sessionId: number;

  @IsString()
  frameId: string;

  @IsOptional()
  @IsNumber()
  detectedStudentId?: number;

  @IsOptional()
  @IsNumber()
  imageFileId?: number;

  @IsOptional()
  @IsNumber()
  confidenceScore?: number;

  @IsBoolean()
  isRealFace: boolean;

  @IsOptional()
  @IsNumber()
  confidenceThreshold?: number;
}
