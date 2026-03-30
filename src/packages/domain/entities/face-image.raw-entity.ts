import { ApprovalStatus } from '../../../common/domain/enums';
import type { RawFaceEmbeddingEntity } from './face-embedding.raw-entity';
import type { RawFaceRegistrationRequestEntity } from './face-registration-request.raw-entity';
import type { RawFileEntity } from './file.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawFaceImageEntity {
  id: number;
  studentId: number;
  requestId: number;
  fileId: number;
  status: ApprovalStatus;
  reviewedById: number | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  student: RawUserEntity;
  request: RawFaceRegistrationRequestEntity;
  file: RawFileEntity;
  reviewedBy: RawUserEntity | null;
  embeddings: RawFaceEmbeddingEntity[];
}
