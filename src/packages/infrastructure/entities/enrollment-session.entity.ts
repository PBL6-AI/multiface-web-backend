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
import { EnrollmentSessionStatus } from '../../../common/domain/enums';
import { FaceEmbeddingEntity } from './face-embedding.entity';
import { UserEntity } from './user.entity';

@Entity('enrollment_sessions')
@Index('IDX_enrollment_sessions_student_created', ['studentId', 'createdAt'])
@Index('IDX_enrollment_sessions_status_created', ['status', 'createdAt'])
export class EnrollmentSessionEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'video_object_key', type: 'varchar', length: 500 })
  videoObjectKey: string;

  @Column({ name: 'video_filename', type: 'varchar', length: 255 })
  videoFilename: string;

  @Column({ name: 'video_mime_type', type: 'varchar', length: 150 })
  videoMimeType: string;

  @Column({ name: 'video_size', type: 'int', nullable: true })
  videoSize: number | null;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 50,
    default: EnrollmentSessionStatus.CREATED,
  })
  status: EnrollmentSessionStatus;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string | null;

  @Column({ name: 'job_id', type: 'varchar', length: 255, nullable: true })
  jobId: string | null;

  @Column({ name: 'processing_started_at', type: 'timestamp', nullable: true })
  processingStartedAt: Date | null;

  @Column({
    name: 'processing_completed_at',
    type: 'timestamp',
    nullable: true,
  })
  processingCompletedAt: Date | null;

  @Column({ name: 'embedding_count', type: 'int', default: 0 })
  embeddingCount: number;

  @Column({ name: 'prototype_ready', type: 'boolean', default: false })
  prototypeReady: boolean;

  @Column({ name: 'processing_summary', type: 'jsonb', nullable: true })
  processingSummary: Record<string, unknown> | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: UserEntity;

  @OneToMany(
    () => FaceEmbeddingEntity,
    (embedding) => embedding.enrollmentSession,
  )
  embeddings: FaceEmbeddingEntity[];
}
