import type { RawFaceImageEntity } from './face-image.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawFaceEmbeddingEntity {
  id: number;
  studentId: number;
  faceImageId: number;
  embedding: number[];
  modelName: string;
  modelVersion: string;
  distanceMetric: string;
  embeddingDimension: number;
  isActive: boolean;
  preprocessProfile: string;
  isL2Normalized: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  student: RawUserEntity;
  faceImage: RawFaceImageEntity;
}
