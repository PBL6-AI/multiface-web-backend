import { IsNumber, IsString, MaxLength } from 'class-validator';

export class JoinClassDto {
  @IsString()
  @MaxLength(100)
  classCode: string;

  @IsNumber()
  studentId: number;
}
