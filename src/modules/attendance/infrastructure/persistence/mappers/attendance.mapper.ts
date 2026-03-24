import { AttendanceSessionEntity } from '../../../../../infrastructure/persistence/typeorm/entities';
import type { AttendanceSession } from '../../../core/entities';

export class AttendanceMapper {
  static toAttendanceSession(
    attendanceSession: AttendanceSessionEntity,
  ): AttendanceSession {
    return {
      id: attendanceSession.id,
      classId: attendanceSession.classId,
      createdById: attendanceSession.createdById,
      startTime: attendanceSession.startTime,
      endTime: attendanceSession.endTime,
      attendanceType: attendanceSession.attendanceType,
      confidenceThreshold: attendanceSession.confidenceThreshold,
      status: attendanceSession.status,
    };
  }
}
