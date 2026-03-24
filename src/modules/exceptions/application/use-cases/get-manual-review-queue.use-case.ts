import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import type { IExceptionsRepository } from '../../core/interfaces/exceptions.repository.interface';

@Injectable()
export class GetManualReviewQueueUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.EXCEPTIONS)
    private readonly exceptionsRepository: IExceptionsRepository,
  ) {}

  async execute(sessionId: number) {
    const [pendingRecords, unknownFaces] = await Promise.all([
      this.exceptionsRepository.listPendingRecords(sessionId),
      this.exceptionsRepository.listUnknownFaces(sessionId),
    ]);

    return {
      sessionId,
      pendingRecords,
      unknownFaces,
    };
  }
}
