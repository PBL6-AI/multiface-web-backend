import {
  AttendanceSessionStatus,
  AttendanceType,
} from '../../../common/domain/enums';
import type { RawAppealEntity } from './appeal.raw-entity';
import type { RawAttendanceRecordEntity } from './attendance-record.raw-entity';
import type { RawClassEntity } from './class.raw-entity';
import type { RawLeaveRequestEntity } from './leave-request.raw-entity';
import type { RawRecognitionEventEntity } from './recognition-event.raw-entity';
import type { RawUnknownFaceEntity } from './unknown-face.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawAttendanceSessionEntity {
  id: number;
  classId: number;
  createdById: number;
  startTime: Date;
  endTime: Date | null;
  attendanceType: AttendanceType;
  confidenceThreshold: number | null;
  status: AttendanceSessionStatus;
  classEntity: RawClassEntity;
  createdBy: RawUserEntity;
  records: RawAttendanceRecordEntity[];
  recognitionEvents: RawRecognitionEventEntity[];
  unknownFaces: RawUnknownFaceEntity[];
  leaveRequests: RawLeaveRequestEntity[];
  appeals: RawAppealEntity[];
}
