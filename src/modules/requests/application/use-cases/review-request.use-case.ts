import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import { ApprovalStatus } from '../../../../common/domain/enums';
import type { IRequestsRepository } from '../../core/interfaces/requests.repository.interface';

interface ReviewLeaveRequestInput {
  type: 'leave';
  requestId: number;
  reviewedById: number;
  status: ApprovalStatus;
}

interface ReviewAppealInput {
  type: 'appeal';
  appealId: number;
  reviewedById: number;
  status: ApprovalStatus;
}

type ReviewRequestInput = ReviewLeaveRequestInput | ReviewAppealInput;

@Injectable()
export class ReviewRequestUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.REQUESTS)
    private readonly requestsRepository: IRequestsRepository,
  ) {}

  async execute(input: ReviewRequestInput): Promise<void> {
    if (input.type === 'leave') {
      await this.requestsRepository.reviewLeaveRequest(input);
      return;
    }

    await this.requestsRepository.reviewAppeal(input);
  }
}
