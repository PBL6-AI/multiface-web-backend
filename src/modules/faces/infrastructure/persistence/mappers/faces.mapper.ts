import { FaceImageEntity } from '../../../../../infrastructure/persistence/typeorm/entities';
import type { FaceImage } from '../../../core/entities';

export class FacesMapper {
  static toFaceImage(faceImage: FaceImageEntity): FaceImage {
    return {
      id: faceImage.id,
      studentId: faceImage.studentId,
      requestId: faceImage.requestId,
      fileId: faceImage.fileId,
      status: faceImage.status,
    };
  }
}
