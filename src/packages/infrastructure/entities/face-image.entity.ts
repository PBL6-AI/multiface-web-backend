import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApprovalStatus } from './enums';
import { FaceEmbeddingEntity } from './face-embedding.entity';
import { FaceRegistrationRequestEntity } from './face-registration-request.entity';
import { FileEntity } from './file.entity';
import { UserEntity } from './user.entity';

@Entity('face_images')
export class FaceImageEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'request_id', type: 'int' })
  requestId: number;

  @Column({ name: 'file_id', type: 'int' })
  fileId: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @Column({ name: 'reviewed_by', type: 'int', nullable: true })
  reviewedById: number | null;

  @Column({ name: 'reviewed_at', type: 'datetime', nullable: true })
  reviewedAt: Date | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
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
