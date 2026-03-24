import { ApprovalStatus } from '../../../../common/domain/enums';

export interface LeaveRequest {
  id: number;
  studentId: number;
  classId: number;
  sessionId: number | null;
  status: ApprovalStatus;
  createdAt: Date;
}
