import { ApprovalStatus } from '../../../../common/domain/enums';
import type { FaceImage } from '../entities';

export interface IFacesRepository {
  ensureRegistrationRequest(studentId: number): Promise<number>;
  createFaceImage(data: {
    studentId: number;
    requestId: number;
    fileId: number;
  }): Promise<FaceImage>;
  reviewFaceImage(data: {
    imageId: number;
    status: ApprovalStatus;
    reviewedById: number;
    rejectionReason?: string;
  }): Promise<FaceImage | null>;
  saveEmbedding(data: {
    studentId: number;
    faceImageId: number;
    embedding: number[];
  }): Promise<void>;
}
