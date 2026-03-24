import { ApprovalStatus } from '../../../../common/domain/enums';

export interface Appeal {
  id: number;
  studentId: number;
  sessionId: number;
  status: ApprovalStatus;
}
