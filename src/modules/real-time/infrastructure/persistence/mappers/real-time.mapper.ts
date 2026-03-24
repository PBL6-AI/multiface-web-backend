import { AttendanceRecordEntity } from '../../../../../infrastructure/persistence/typeorm/entities';
import type { SessionLiveData } from '../../../core/entities';

export class RealTimeMapper {
  static toSessionLiveData(
    sessionId: number,
    records: AttendanceRecordEntity[],
  ): SessionLiveData {
    return {
      sessionId,
      totalRecognized: records.length,
      presentStudentIds: records.map((record) => record.studentId),
      lastUpdatedAt: records[0]?.recordedAt ?? null,
    };
  }
}
