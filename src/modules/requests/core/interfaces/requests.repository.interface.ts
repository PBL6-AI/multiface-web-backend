import { ApprovalStatus } from '../../../../common/domain/enums';
import type { Appeal, LeaveRequest } from '../entities';

export interface IRequestsRepository {
  createLeaveRequest(data: {
    studentId: number;
    classId: number;
    sessionId?: number;
    reason: string;
    evidenceFileId?: number;
  }): Promise<LeaveRequest>;
  reviewLeaveRequest(data: {
    requestId: number;
    reviewedById: number;
    status: ApprovalStatus;
  }): Promise<void>;
  createAppeal(data: {
    studentId: number;
    sessionId: number;
    reason: string;
    evidenceFileId?: number;
  }): Promise<Appeal>;
  reviewAppeal(data: {
    appealId: number;
    reviewedById: number;
    status: ApprovalStatus;
  }): Promise<void>;
}
