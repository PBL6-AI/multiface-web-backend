import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @MaxLength(255)
  className: string;

  @IsNumber()
  teacherId: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  classCode?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
