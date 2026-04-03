import { ApprovalStatus } from '../../../common/domain/enums';
import type { RawAttendanceRecordEntity } from './attendance-record.raw-entity';
import type { RawAttendanceSessionEntity } from './attendance-session.raw-entity';
import type { RawFileEntity } from './file.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawAppealEntity {
  id: number;
  studentId: number;
  sessionId: number;
  attendanceRecordId: number | null;
  reason: string;
  evidenceFileId: number | null;
  status: ApprovalStatus;
  reviewedById: number | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  student: RawUserEntity;
  session: RawAttendanceSessionEntity;
  attendanceRecord: RawAttendanceRecordEntity | null;
  evidenceFile: RawFileEntity | null;
  reviewedBy: RawUserEntity | null;
}
