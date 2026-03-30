import { ApprovalStatus } from '../../../common/domain/enums';
import type { RawFaceImageEntity } from './face-image.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawFaceRegistrationRequestEntity {
  id: number;
  studentId: number;
  status: ApprovalStatus;
  reviewedById: number | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  student: RawUserEntity;
  reviewedBy: RawUserEntity | null;
  faceImages: RawFaceImageEntity[];
}
