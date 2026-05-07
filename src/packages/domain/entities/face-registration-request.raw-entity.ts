import {
  ApprovalStatus,
  FaceRegistrationEmbeddingStatus,
  FaceRegistrationSessionStatus,
} from '../../../common/domain/enums';
import type { RawFaceImageEntity } from './face-image.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawFaceRegistrationRequestEntity {
  id: number;
  studentId: number;
  status: ApprovalStatus;
  reviewedById: number | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  sessionStatus: FaceRegistrationSessionStatus;
  embeddingStatus: FaceRegistrationEmbeddingStatus;
  targetCountPerPose: number;
  completedAt: Date | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  student: RawUserEntity;
  reviewedBy: RawUserEntity | null;
  faceImages: RawFaceImageEntity[];
}
