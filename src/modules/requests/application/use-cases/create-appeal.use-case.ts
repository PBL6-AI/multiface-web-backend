import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import type { IRequestsRepository } from '../../core/interfaces/requests.repository.interface';

interface CreateAppealInput {
  studentId: number;
  sessionId: number;
  reason: string;
  evidenceFileId?: number;
}

@Injectable()
export class CreateAppealUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.REQUESTS)
    private readonly requestsRepository: IRequestsRepository,
  ) {}

  execute(input: CreateAppealInput) {
    return this.requestsRepository.createAppeal(input);
  }
}
