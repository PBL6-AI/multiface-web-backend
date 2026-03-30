import type { RawFaceImageEntity } from './face-image.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawFaceEmbeddingEntity {
  id: number;
  studentId: number;
  faceImageId: number;
  embedding: number[];
  createdAt: Date;
  student: RawUserEntity;
  faceImage: RawFaceImageEntity;
}
