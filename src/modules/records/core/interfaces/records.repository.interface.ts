import type { AttendanceRecord, StudentAttendanceSummary } from '../entities';

export interface IRecordsRepository {
  listSessionRecords(sessionId: number): Promise<AttendanceRecord[]>;
  getStudentSummary(studentId: number): Promise<StudentAttendanceSummary>;
}
