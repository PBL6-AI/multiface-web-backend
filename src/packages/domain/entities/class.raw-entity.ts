import type { RawAttendanceSessionEntity } from './attendance-session.raw-entity';
import type { RawClassMemberEntity } from './class-member.raw-entity';
import type { RawClassScheduleEntity } from './class-schedule.raw-entity';
import type { RawLeaveRequestEntity } from './leave-request.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawClassEntity {
  id: number;
  className: string;
  classCode: string;
  teacherId: number;
  description: string | null;
  createdAt: Date;
  teacher: RawUserEntity;
  classMembers: RawClassMemberEntity[];
  schedules: RawClassScheduleEntity[];
  attendanceSessions: RawAttendanceSessionEntity[];
  leaveRequests: RawLeaveRequestEntity[];
}
