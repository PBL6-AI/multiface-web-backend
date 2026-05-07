import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApprovalStatus } from './enums';
import { FaceImagePose } from '../../../common/domain/enums';
import { FaceEmbeddingEntity } from './face-embedding.entity';
import { FaceRegistrationRequestEntity } from './face-registration-request.entity';
import { FileEntity } from './file.entity';
import { UserEntity } from './user.entity';

@Entity('face_images')
@Index('IDX_face_images_request_status_created', [
  'requestId',
  'status',
  'createdAt',
])
@Index('IDX_face_images_student_status', ['studentId', 'status'])
export class FaceImageEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'request_id', type: 'int' })
  requestId: number;

  @Column({ name: 'file_id', type: 'int' })
  fileId: number;

  @Column({ name: 'aligned_file_id', type: 'int', nullable: true })
  alignedFileId: number | null;

  @Column({ name: 'pose', type: 'varchar', length: 20 })
  pose: FaceImagePose;

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
    name: 'capture_source',
    type: 'varchar',
    length: 50,
    default: 'user_upload',
  })
  captureSource: string;

  @Column({ name: 'quality_score', type: 'float', nullable: true })
  qualityScore: number | null;

  @Column({ name: 'captured_at', type: 'timestamp', nullable: true })
  capturedAt: Date | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.faceImages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: UserEntity;

  @ManyToOne(
    () => FaceRegistrationRequestEntity,
    (faceRegistrationRequest) => faceRegistrationRequest.faceImages,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'request_id' })
  request: FaceRegistrationRequestEntity;

  @ManyToOne(() => FileEntity, (file) => file.faceImages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'file_id' })
  file: FileEntity;

  @ManyToOne(() => FileEntity, (file) => file.alignedFaceImages, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'aligned_file_id' })
  alignedFile: FileEntity | null;

  @ManyToOne(() => UserEntity, (user) => user.reviewedFaceImages, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy: UserEntity | null;

  @OneToMany(
    () => FaceEmbeddingEntity,
    (faceEmbedding) => faceEmbedding.faceImage,
  )
  embeddings: FaceEmbeddingEntity[];
}
