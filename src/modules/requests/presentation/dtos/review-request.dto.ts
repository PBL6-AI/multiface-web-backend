import { IsEnum, IsNumber } from 'class-validator';
import { ApprovalStatus } from '../../../../common/domain/enums';

export class ReviewRequestDto {
  @IsNumber()
  reviewedById: number;

  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;
}
