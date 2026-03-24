import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import { AttendanceType } from '../../../../common/domain/enums';
import type { AttendanceSession } from '../../core/entities';
import type { IAttendanceRepository } from '../../core/interfaces/attendance.repository.interface';

interface StartAttendanceSessionInput {
  classId: number;
  createdById: number;
  startTime?: Date;
  endTime?: Date;
  attendanceType?: AttendanceType;
  confidenceThreshold?: number;
}

@Injectable()
export class StartAttendanceSessionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.ATTENDANCE)
    private readonly attendanceRepository: IAttendanceRepository,
  ) {}

  async execute(
    input: StartAttendanceSessionInput,
  ): Promise<AttendanceSession> {
    return this.attendanceRepository.createSession({
      classId: input.classId,
      createdById: input.createdById,
      startTime: input.startTime ?? new Date(),
      endTime: input.endTime,
      attendanceType: input.attendanceType ?? AttendanceType.AUTOMATIC,
      confidenceThreshold: input.confidenceThreshold,
    });
  }
}
