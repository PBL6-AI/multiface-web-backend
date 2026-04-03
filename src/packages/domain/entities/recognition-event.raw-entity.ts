import type { FaceBoundingBox } from '../../../common/types';
import type { RawAttendanceSessionEntity } from './attendance-session.raw-entity';
import type { RawFaceEmbeddingEntity } from './face-embedding.raw-entity';
import type { RawFileEntity } from './file.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawRecognitionEventEntity {
  id: number;
  sessionId: number;
  frameId: string;
  imageFileId: number | null;
  detectedStudentId: number | null;
  matchedEmbeddingId: number | null;
  confidenceScore: number | null;
  similarityScore: number | null;
  isRealFace: boolean;
  antiSpoofingScore: number | null;
  boundingBox: FaceBoundingBox | null;
  landmarks: Array<{ x: number; y: number }> | null;
  detectorModel: string;
  detectorModelVersion: string | null;
  recognitionModel: string;
  recognitionModelVersion: string;
  antiSpoofingModel: string | null;
  antiSpoofingModelVersion: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  session: RawAttendanceSessionEntity;
  imageFile: RawFileEntity | null;
  detectedStudent: RawUserEntity | null;
  matchedEmbedding: RawFaceEmbeddingEntity | null;
}
