import {
  AttendanceSessionStatus,
  AttendanceType,
} from '../../../common/domain/enums';
import type { RawAttendanceRecordEntity } from './attendance-record.raw-entity';
import type { RawClassEntity } from './class.raw-entity';
import type { RawRecognitionEventEntity } from './recognition-event.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawAttendanceSessionEntity {
  id: number;
  classId: number;
  createdById: number;
  startTime: Date;
  endTime: Date | null;
  attendanceType: AttendanceType;
  confidenceThreshold: number | null;
  sourceDeviceId: string | null;
  cameraId: string | null;
  videoSource: string | null;
  status: AttendanceSessionStatus;
  classEntity: RawClassEntity;
  createdBy: RawUserEntity;
  records: RawAttendanceRecordEntity[];
  recognitionEvents: RawRecognitionEventEntity[];
}
