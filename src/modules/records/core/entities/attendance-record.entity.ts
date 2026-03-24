import { AttendanceRecordStatus } from '../../../../common/domain/enums';

export interface AttendanceRecord {
  id: number;
  sessionId: number;
  studentId: number;
  status: AttendanceRecordStatus;
  confidenceScore: number | null;
  recordedAt: Date;
}
