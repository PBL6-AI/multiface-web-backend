import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAppealDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  sessionId: number;

  @IsString()
  reason: string;

  @IsOptional()
  @IsNumber()
  evidenceFileId?: number;
}
