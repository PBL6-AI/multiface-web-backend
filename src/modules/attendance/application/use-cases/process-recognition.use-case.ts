import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import { AttendanceRecordStatus } from '../../../../common/domain/enums';
import type { IAttendanceRepository } from '../../core/interfaces/attendance.repository.interface';

interface ProcessRecognitionInput {
  sessionId: number;
  frameId: string;
  detectedStudentId?: number;
  imageFileId?: number;
  confidenceScore?: number;
  isRealFace: boolean;
  confidenceThreshold?: number;
}

@Injectable()
export class ProcessRecognitionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.ATTENDANCE)
    private readonly attendanceRepository: IAttendanceRepository,
  ) {}

  async execute(input: ProcessRecognitionInput): Promise<{
    accepted: boolean;
    reason?: string;
  }> {
    await this.attendanceRepository.addRecognitionEvent({
      sessionId: input.sessionId,
      frameId: input.frameId,
      detectedStudentId: input.detectedStudentId,
      imageFileId: input.imageFileId,
      confidenceScore: input.confidenceScore,
      isRealFace: input.isRealFace,
    });

    if (!input.isRealFace) {
      return {
        accepted: false,
        reason: 'Spoofing detected',
      };
    }

    if (!input.detectedStudentId) {
      return {
        accepted: false,
        reason: 'Unknown face',
      };
    }

    const threshold = input.confidenceThreshold ?? 0.7;
    if ((input.confidenceScore ?? 0) < threshold) {
      return {
        accepted: false,
        reason: 'Confidence too low',
      };
    }

    const alreadyRecorded = await this.attendanceRepository.hasAttendanceRecord(
      input.sessionId,
      input.detectedStudentId,
    );

    if (alreadyRecorded) {
      return {
        accepted: false,
        reason: 'Duplicate recognition skipped',
      };
    }

    await this.attendanceRepository.markAttendance({
      sessionId: input.sessionId,
      studentId: input.detectedStudentId,
      status: AttendanceRecordStatus.PRESENT,
      confidenceScore: input.confidenceScore,
      imageFileId: input.imageFileId,
    });

    return { accepted: true };
  }
}
