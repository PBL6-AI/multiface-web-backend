import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ApprovalStatus,
  FaceRegistrationEmbeddingStatus,
  FaceRegistrationSessionStatus,
} from './enums';
import { FaceImageEntity } from './face-image.entity';
import { UserEntity } from './user.entity';

@Entity('face_registration_requests')
@Index('IDX_face_registration_requests_student_status_created', [
  'studentId',
  'status',
  'createdAt',
])
export class FaceRegistrationRequestEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  // Legacy approval status retained for backward-compatible schema rollout.
  @Column({
    name: 'status',
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @Column({ name: 'reviewed_by', type: 'int', nullable: true })
  reviewedById: number | null;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({
    name: 'session_status',
    type: 'varchar',
    length: 50,
    default: FaceRegistrationSessionStatus.COLLECTING,
  })
  sessionStatus: FaceRegistrationSessionStatus;

  @Column({
    name: 'embedding_status',
    type: 'varchar',
    length: 50,
    default: FaceRegistrationEmbeddingStatus.NOT_STARTED,
  })
  embeddingStatus: FaceRegistrationEmbeddingStatus;

  @Column({
    name: 'target_count_per_pose',
    type: 'int',
    default: 20,
  })
  targetCountPerPose: number;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.faceRegistrationRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: UserEntity;

  @ManyToOne(
    () => UserEntity,
    (user) => user.reviewedFaceRegistrationRequests,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy: UserEntity | null;

  @OneToMany(() => FaceImageEntity, (faceImage) => faceImage.request)
  faceImages: FaceImageEntity[];
}
