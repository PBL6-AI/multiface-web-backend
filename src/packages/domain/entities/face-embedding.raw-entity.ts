import type { RawFaceImageEntity } from './face-image.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawFaceEmbeddingEntity {
  id: number;
  studentId: number;
  faceImageId: number | null;
  enrollmentSessionId: number | null;
  embedding: number[];
  modelName: string;
  modelVersion: string;
  distanceMetric: string;
  embeddingDimension: number;
  isActive: boolean;
  preprocessProfile: string;
  isL2Normalized: boolean;
  metadata: Record<string, unknown> | null;
  qualityScore: number | null;
  yaw: number | null;
  pitch: number | null;
  roll: number | null;
  createdAt: Date;
  student: RawUserEntity;
  faceImage: RawFaceImageEntity | null;
}
