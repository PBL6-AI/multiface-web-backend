import { AppealEntity } from './appeal.entity';
import { AttendanceRecordEntity } from './attendance-record.entity';
import { AttendanceSessionEntity } from './attendance-session.entity';
import { ClassMemberEntity } from './class-member.entity';
import { ClassScheduleEntity } from './class-schedule.entity';
import { ClassEntity } from './class.entity';
import { DepartmentEntity } from './department.entity';
import { FaceEmbeddingEntity } from './face-embedding.entity';
import { FaceImageEntity } from './face-image.entity';
import { FaceRegistrationRequestEntity } from './face-registration-request.entity';
import { FileEntity } from './file.entity';
import { LeaveRequestEntity } from './leave-request.entity';
import { NotificationEntity } from './notification.entity';
import { PermissionEntity } from './permission.entity';
import { RecognitionEventEntity } from './recognition-event.entity';
import { RefreshTokenEntity } from './refresh-token.entity';
import { RolePermissionEntity } from './role-permission.entity';
import { RoleEntity } from './role.entity';
import { SpecializationEntity } from './specialization.entity';
import { UnknownFaceEntity } from './unknown-face.entity';
import { UserEntity } from './user.entity';

export { AppealEntity } from './appeal.entity';
export { AttendanceRecordEntity } from './attendance-record.entity';
export { AttendanceSessionEntity } from './attendance-session.entity';
export { ClassMemberEntity } from './class-member.entity';
export { ClassScheduleEntity } from './class-schedule.entity';
export { ClassEntity } from './class.entity';
export { DepartmentEntity } from './department.entity';
export { FaceEmbeddingEntity } from './face-embedding.entity';
export { FaceImageEntity } from './face-image.entity';
export { FaceRegistrationRequestEntity } from './face-registration-request.entity';
export { FileEntity } from './file.entity';
export { LeaveRequestEntity } from './leave-request.entity';
export { NotificationEntity } from './notification.entity';
export { PermissionEntity } from './permission.entity';
export { RecognitionEventEntity } from './recognition-event.entity';
export { RefreshTokenEntity } from './refresh-token.entity';
export { RolePermissionEntity } from './role-permission.entity';
export { RoleEntity } from './role.entity';
export { SpecializationEntity } from './specialization.entity';
export { UnknownFaceEntity } from './unknown-face.entity';
export { UserEntity } from './user.entity';

export const ENTITIES = [
  DepartmentEntity,
  SpecializationEntity,
  RoleEntity,
  PermissionEntity,
  RolePermissionEntity,
  UserEntity,
  RefreshTokenEntity,
  ClassEntity,
  ClassMemberEntity,
  ClassScheduleEntity,
  FileEntity,
  FaceRegistrationRequestEntity,
  FaceImageEntity,
  FaceEmbeddingEntity,
  AttendanceSessionEntity,
  AttendanceRecordEntity,
  RecognitionEventEntity,
  UnknownFaceEntity,
  LeaveRequestEntity,
  AppealEntity,
  NotificationEntity,
] as const;
