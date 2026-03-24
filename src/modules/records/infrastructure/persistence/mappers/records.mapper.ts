import { AttendanceRecordEntity } from '../../../../../infrastructure/persistence/typeorm/entities';
import type {
  AttendanceRecord,
  StudentAttendanceSummary,
} from '../../../core/entities';

export class RecordsMapper {
  static toAttendanceRecord(record: AttendanceRecordEntity): AttendanceRecord {
    return {
      id: record.id,
      sessionId: record.sessionId,
      studentId: record.studentId,
      status: record.status,
      confidenceScore: record.confidenceScore,
      recordedAt: record.recordedAt,
    };
  }

  static toStudentAttendanceSummary(
    data: StudentAttendanceSummary,
  ): StudentAttendanceSummary {
    return data;
  }
}
