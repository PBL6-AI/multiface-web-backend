import type { FaceBoundingBox } from '../../../common/types';
import type { RawAttendanceSessionEntity } from './attendance-session.raw-entity';
import type { RawFileEntity } from './file.raw-entity';

export interface RawUnknownFaceEntity {
  id: number;
  sessionId: number;
  frameId: string;
  imageFileId: number;
  antiSpoofingScore: number | null;
  boundingBox: FaceBoundingBox | null;
  metadata: Record<string, unknown> | null;
  detectedAt: Date;
  session: RawAttendanceSessionEntity;
  imageFile: RawFileEntity;
}
