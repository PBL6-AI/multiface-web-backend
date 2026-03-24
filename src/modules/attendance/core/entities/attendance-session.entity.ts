import {
  AttendanceSessionStatus,
  AttendanceType,
} from '../../../../common/domain/enums';

export interface AttendanceSession {
  id: number;
  classId: number;
  createdById: number;
  startTime: Date;
  endTime: Date | null;
  attendanceType: AttendanceType;
  confidenceThreshold: number | null;
  status: AttendanceSessionStatus;
}
