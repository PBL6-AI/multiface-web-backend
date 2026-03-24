import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import type { SessionLiveData } from '../../core/entities';
import type { IRealTimeRepository } from '../../core/interfaces/real-time.repository.interface';

@Injectable()
export class GetSessionLiveDataUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.REAL_TIME)
    private readonly realTimeRepository: IRealTimeRepository,
  ) {}

  execute(sessionId: number): Promise<SessionLiveData> {
    return this.realTimeRepository.getSessionLiveData(sessionId);
  }
}
