import { AttendanceRecordStatus } from '../../../../common/domain/enums';
import type { PendingAttendanceReview, UnknownFace } from '../entities';

export interface IExceptionsRepository {
  listPendingRecords(sessionId: number): Promise<PendingAttendanceReview[]>;
  listUnknownFaces(sessionId: number): Promise<UnknownFace[]>;
  resolvePendingRecord(
    recordId: number,
    status: AttendanceRecordStatus,
  ): Promise<void>;
}
