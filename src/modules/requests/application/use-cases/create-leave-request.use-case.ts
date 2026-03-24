import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import type { IRequestsRepository } from '../../core/interfaces/requests.repository.interface';

interface CreateLeaveRequestInput {
  studentId: number;
  classId: number;
  sessionId?: number;
  reason: string;
  evidenceFileId?: number;
}

@Injectable()
export class CreateLeaveRequestUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.REQUESTS)
    private readonly requestsRepository: IRequestsRepository,
  ) {}

  execute(input: CreateLeaveRequestInput) {
    return this.requestsRepository.createLeaveRequest(input);
  }
}
