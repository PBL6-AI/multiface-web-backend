import type { RawAttendanceSessionEntity } from './attendance-session.raw-entity';
import type { RawFileEntity } from './file.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawRecognitionEventEntity {
  id: number;
  sessionId: number;
  frameId: string;
  imageFileId: number | null;
  detectedStudentId: number | null;
  confidenceScore: number | null;
  isRealFace: boolean;
  createdAt: Date;
  session: RawAttendanceSessionEntity;
  imageFile: RawFileEntity | null;
  detectedStudent: RawUserEntity | null;
}
