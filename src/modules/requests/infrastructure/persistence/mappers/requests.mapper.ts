import {
  AppealEntity,
  LeaveRequestEntity,
} from '../../../../../infrastructure/persistence/typeorm/entities';
import type { Appeal, LeaveRequest } from '../../../core/entities';

export class RequestsMapper {
  static toLeaveRequest(leaveRequest: LeaveRequestEntity): LeaveRequest {
    return {
      id: leaveRequest.id,
      studentId: leaveRequest.studentId,
      classId: leaveRequest.classId,
      sessionId: leaveRequest.sessionId,
      status: leaveRequest.status,
      createdAt: leaveRequest.createdAt,
    };
  }

  static toAppeal(appeal: AppealEntity): Appeal {
    return {
      id: appeal.id,
      studentId: appeal.studentId,
      sessionId: appeal.sessionId,
      status: appeal.status,
    };
  }
}
