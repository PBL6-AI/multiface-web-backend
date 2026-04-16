import { FaceImagePose } from '../../common/domain/enums';

export const FACE_REGISTRATION_REQUIRED_POSES = [
  FaceImagePose.FRONT,
  FaceImagePose.LEFT,
  FaceImagePose.RIGHT,
  FaceImagePose.UP,
  FaceImagePose.DOWN,
] as const;
