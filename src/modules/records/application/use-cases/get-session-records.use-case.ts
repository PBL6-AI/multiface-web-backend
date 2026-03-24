import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import type { AttendanceRecord } from '../../core/entities';
import type { IRecordsRepository } from '../../core/interfaces/records.repository.interface';

@Injectable()
export class GetSessionRecordsUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.RECORDS)
    private readonly recordsRepository: IRecordsRepository,
  ) {}

  execute(sessionId: number): Promise<AttendanceRecord[]> {
    return this.recordsRepository.listSessionRecords(sessionId);
  }
}
