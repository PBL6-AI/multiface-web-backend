import type { RawAppealEntity } from './appeal.raw-entity';
import type { RawAttendanceRecordEntity } from './attendance-record.raw-entity';
import type { RawFaceImageEntity } from './face-image.raw-entity';
import type { RawLeaveRequestEntity } from './leave-request.raw-entity';
import type { RawRecognitionEventEntity } from './recognition-event.raw-entity';
import type { RawUnknownFaceEntity } from './unknown-face.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawFileEntity {
  id: number;
  uploaderId: number;
  fileKey: string;
  filename: string;
  mimeType: string;
  size: number;
  category: string;
  storageProvider: string;
  checksum: string | null;
  createdAt: Date;
  uploader: RawUserEntity;
  avatarUsers: RawUserEntity[];
  faceImages: RawFaceImageEntity[];
  alignedFaceImages: RawFaceImageEntity[];
  attendanceRecords: RawAttendanceRecordEntity[];
  recognitionEvents: RawRecognitionEventEntity[];
  unknownFaces: RawUnknownFaceEntity[];
  leaveRequestEvidence: RawLeaveRequestEntity[];
  appealEvidence: RawAppealEntity[];
}
