import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import { AttendanceRecordStatus } from '../../../../common/domain/enums';
import type { IExceptionsRepository } from '../../core/interfaces/exceptions.repository.interface';

interface ResolvePendingRecordInput {
  recordId: number;
  status: AttendanceRecordStatus.PRESENT | AttendanceRecordStatus.ABSENT;
}

@Injectable()
export class ResolvePendingRecordUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.EXCEPTIONS)
    private readonly exceptionsRepository: IExceptionsRepository,
  ) {}

  async execute(input: ResolvePendingRecordInput): Promise<void> {
    await this.exceptionsRepository.resolvePendingRecord(
      input.recordId,
      input.status,
    );
  }
}
