import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { AppealEntity } from './appeal.entity';
import { AttendanceRecordEntity } from './attendance-record.entity';
import { AttendanceSessionEntity } from './attendance-session.entity';
import { ClassMemberEntity } from './class-member.entity';
import { ClassEntity } from './class.entity';
import { DepartmentEntity } from './department.entity';
import { FaceEmbeddingEntity } from './face-embedding.entity';
import { FaceImageEntity } from './face-image.entity';
import { FaceRegistrationRequestEntity } from './face-registration-request.entity';
import { FileEntity } from './file.entity';
import { LeaveRequestEntity } from './leave-request.entity';
import { NotificationEntity } from './notification.entity';
import { RecognitionEventEntity } from './recognition-event.entity';
import { RefreshTokenEntity } from './refresh-token.entity';
import { RoleEntity } from './role.entity';
import { SpecializationEntity } from './specialization.entity';

@Entity('users')
@Unique('UQ_users_email', ['email'])
@Unique('UQ_users_user_code', ['userCode'])
@Index('IDX_users_user_code', ['userCode'])
@Index('IDX_users_role_id', ['roleId'])
@Index('IDX_users_department_id', ['departmentId'])
@Index('IDX_users_specialization_id', ['specializationId'])
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;

  @Column({ name: 'user_code', type: 'varchar', length: 50 })
  userCode: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'role_id', type: 'int' })
  roleId: number;

  @Column({ name: 'avatar_file_id', type: 'int', nullable: true })
  avatarFileId: number | null;

  @Column({ name: 'phone', type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ name: 'department_id', type: 'int', nullable: true })
  departmentId: number | null;

  @Column({ name: 'specialization_id', type: 'int', nullable: true })
  specializationId: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => RoleEntity, (role) => role.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @ManyToOne(() => FileEntity, (file) => file.avatarUsers, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'avatar_file_id' })
  avatarFile: FileEntity | null;

  @ManyToOne(() => DepartmentEntity, (department) => department.users, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity | null;

  @ManyToOne(
    () => SpecializationEntity,
    (specialization) => specialization.users,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  @JoinColumn({ name: 'specialization_id' })
  specialization: SpecializationEntity | null;

  @OneToMany(() => RefreshTokenEntity, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshTokenEntity[];

  @OneToMany(() => ClassEntity, (classEntity) => classEntity.teacher)
  taughtClasses: ClassEntity[];

  @OneToMany(() => ClassMemberEntity, (classMember) => classMember.student)
  classMemberships: ClassMemberEntity[];

  @OneToMany(() => FileEntity, (file) => file.uploader)
  uploadedFiles: FileEntity[];

  @OneToMany(() => FaceRegistrationRequestEntity, (request) => request.student)
  faceRegistrationRequests: FaceRegistrationRequestEntity[];

  @OneToMany(
    () => FaceRegistrationRequestEntity,
    (request) => request.reviewedBy,
  )
  reviewedFaceRegistrationRequests: FaceRegistrationRequestEntity[];

  @OneToMany(() => FaceImageEntity, (faceImage) => faceImage.student)
  faceImages: FaceImageEntity[];

  @OneToMany(() => FaceImageEntity, (faceImage) => faceImage.reviewedBy)
  reviewedFaceImages: FaceImageEntity[];

  @OneToMany(
    () => FaceEmbeddingEntity,
    (faceEmbedding) => faceEmbedding.student,
  )
  faceEmbeddings: FaceEmbeddingEntity[];

  @OneToMany(
    () => AttendanceSessionEntity,
    (attendanceSession) => attendanceSession.createdBy,
  )
  createdAttendanceSessions: AttendanceSessionEntity[];

  @OneToMany(
    () => AttendanceRecordEntity,
    (attendanceRecord) => attendanceRecord.student,
  )
  attendanceRecords: AttendanceRecordEntity[];

  @OneToMany(
    () => RecognitionEventEntity,
    (recognitionEvent) => recognitionEvent.detectedStudent,
  )
  recognitionEvents: RecognitionEventEntity[];

  @OneToMany(() => LeaveRequestEntity, (leaveRequest) => leaveRequest.student)
  leaveRequests: LeaveRequestEntity[];

  @OneToMany(
    () => LeaveRequestEntity,
    (leaveRequest) => leaveRequest.reviewedBy,
  )
  reviewedLeaveRequests: LeaveRequestEntity[];

  @OneToMany(() => AppealEntity, (appeal) => appeal.student)
  appeals: AppealEntity[];

  @OneToMany(() => AppealEntity, (appeal) => appeal.reviewedBy)
  reviewedAppeals: AppealEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.user)
  notifications: NotificationEntity[];
}
