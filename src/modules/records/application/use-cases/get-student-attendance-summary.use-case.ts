import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import type { StudentAttendanceSummary } from '../../core/entities';
import type { IRecordsRepository } from '../../core/interfaces/records.repository.interface';

@Injectable()
export class GetStudentAttendanceSummaryUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.RECORDS)
    private readonly recordsRepository: IRecordsRepository,
  ) {}

  execute(studentId: number): Promise<StudentAttendanceSummary> {
    return this.recordsRepository.getStudentSummary(studentId);
  }
}
