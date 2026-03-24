import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApprovalStatus } from '../../../../common/domain/enums';

export class ReviewFaceImageDto {
  @IsNumber()
  imageId: number;

  @IsNumber()
  reviewedById: number;

  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
