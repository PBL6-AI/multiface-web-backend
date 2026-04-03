import { ApprovalStatus } from '../../../common/domain/enums';
import type { RawAttendanceSessionEntity } from './attendance-session.raw-entity';
import type { RawClassEntity } from './class.raw-entity';
import type { RawFileEntity } from './file.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawLeaveRequestEntity {
  id: number;
  studentId: number;
  classId: number;
  sessionId: number | null;
  reason: string;
  evidenceFileId: number | null;
  status: ApprovalStatus;
  reviewedById: number | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  student: RawUserEntity;
  classEntity: RawClassEntity;
  session: RawAttendanceSessionEntity | null;
  evidenceFile: RawFileEntity | null;
  reviewedBy: RawUserEntity | null;
}
