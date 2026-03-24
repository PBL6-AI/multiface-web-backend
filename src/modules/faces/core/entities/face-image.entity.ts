import { ApprovalStatus } from '../../../../common/domain/enums';

export interface FaceImage {
  id: number;
  studentId: number;
  requestId: number;
  fileId: number;
  status: ApprovalStatus;
}
