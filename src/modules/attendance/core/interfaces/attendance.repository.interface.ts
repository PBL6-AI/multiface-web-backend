import {
  AttendanceRecordStatus,
  AttendanceType,
} from '../../../../common/domain/enums';
import type { AttendanceSession } from '../entities';

export interface IAttendanceRepository {
  createSession(data: {
    classId: number;
    createdById: number;
    startTime: Date;
    endTime?: Date;
    attendanceType: AttendanceType;
    confidenceThreshold?: number;
  }): Promise<AttendanceSession>;
  addRecognitionEvent(data: {
    sessionId: number;
    frameId: string;
    imageFileId?: number;
    detectedStudentId?: number;
    confidenceScore?: number;
    isRealFace: boolean;
  }): Promise<void>;
  hasAttendanceRecord(sessionId: number, studentId: number): Promise<boolean>;
  markAttendance(data: {
    sessionId: number;
    studentId: number;
    status: AttendanceRecordStatus;
    confidenceScore?: number;
    imageFileId?: number;
  }): Promise<void>;
}
