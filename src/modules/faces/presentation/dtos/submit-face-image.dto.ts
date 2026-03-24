import { IsNumber } from 'class-validator';

export class SubmitFaceImageDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  fileId: number;
}
