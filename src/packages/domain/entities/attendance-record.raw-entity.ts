import { AttendanceRecordStatus } from '../../../common/domain/enums';
import type { RawRecognitionEventEntity } from './recognition-event.raw-entity';
import type { RawAttendanceSessionEntity } from './attendance-session.raw-entity';
import type { RawFileEntity } from './file.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawAttendanceRecordEntity {
  id: number;
  sessionId: number;
  studentId: number;
  status: AttendanceRecordStatus;
  confidenceScore: number | null;
  imageFileId: number | null;
  recognitionEventId: number | null;
  recordedAt: Date;
  session: RawAttendanceSessionEntity;
  student: RawUserEntity;
  imageFile: RawFileEntity | null;
  recognitionEvent: RawRecognitionEventEntity | null;
}
