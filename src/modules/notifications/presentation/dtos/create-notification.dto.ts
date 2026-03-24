import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @IsNumber()
  userId: number;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  content: string;
}
