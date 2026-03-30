import type { RawAttendanceSessionEntity } from './attendance-session.raw-entity';
import type { RawFileEntity } from './file.raw-entity';

export interface RawUnknownFaceEntity {
  id: number;
  sessionId: number;
  frameId: string;
  imageFileId: number;
  detectedAt: Date;
  session: RawAttendanceSessionEntity;
  imageFile: RawFileEntity;
}
