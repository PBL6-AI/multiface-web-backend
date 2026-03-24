import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  classId: number;

  @IsOptional()
  @IsNumber()
  sessionId?: number;

  @IsString()
  reason: string;

  @IsOptional()
  @IsNumber()
  evidenceFileId?: number;
}
