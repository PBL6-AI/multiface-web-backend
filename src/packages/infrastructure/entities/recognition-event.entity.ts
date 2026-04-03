import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  EDGEFACE_DEFAULT_MODEL,
  EDGEFACE_DEFAULT_MODEL_VERSION,
  SCRFD_DEFAULT_MODEL,
} from '../../../common/constants/ai-model.constants';
import type { FaceBoundingBox } from '../../../common/types';
import { AttendanceSessionEntity } from './attendance-session.entity';
import { FaceEmbeddingEntity } from './face-embedding.entity';
import { FileEntity } from './file.entity';
import { UserEntity } from './user.entity';

@Entity('recognition_events')
@Index('IDX_recognition_events_session_created', ['sessionId', 'createdAt'])
@Index('IDX_recognition_events_detected_student', ['detectedStudentId'])
export class RecognitionEventEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'session_id', type: 'int' })
  sessionId: number;

  @Column({ name: 'frame_id', type: 'varchar', length: 120 })
  frameId: string;

  @Column({ name: 'image_file_id', type: 'int', nullable: true })
  imageFileId: number | null;

  @Column({ name: 'detected_student_id', type: 'int', nullable: true })
  detectedStudentId: number | null;

  @Column({ name: 'matched_embedding_id', type: 'int', nullable: true })
  matchedEmbeddingId: number | null;

  @Column({ name: 'confidence_score', type: 'float', nullable: true })
  confidenceScore: number | null;

  @Column({ name: 'similarity_score', type: 'float', nullable: true })
  similarityScore: number | null;

  @Column({ name: 'is_real_face', type: 'boolean', default: true })
  isRealFace: boolean;

  @Column({ name: 'anti_spoofing_score', type: 'float', nullable: true })
  antiSpoofingScore: number | null;

  @Column({ name: 'bounding_box', type: 'jsonb', nullable: true })
  boundingBox: FaceBoundingBox | null;

  @Column({ name: 'landmarks', type: 'jsonb', nullable: true })
  landmarks: Array<{ x: number; y: number }> | null;

  @Column({
    name: 'detector_model',
    type: 'varchar',
    length: 120,
    default: SCRFD_DEFAULT_MODEL,
  })
  detectorModel: string;

  @Column({
    name: 'detector_model_version',
    type: 'varchar',
    length: 60,
    nullable: true,
  })
  detectorModelVersion: string | null;

  @Column({
    name: 'recognition_model',
    type: 'varchar',
    length: 120,
    default: EDGEFACE_DEFAULT_MODEL,
  })
  recognitionModel: string;

  @Column({
    name: 'recognition_model_version',
    type: 'varchar',
    length: 60,
    default: EDGEFACE_DEFAULT_MODEL_VERSION,
  })
  recognitionModelVersion: string;

  @Column({
    name: 'anti_spoofing_model',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  antiSpoofingModel: string | null;

  @Column({
    name: 'anti_spoofing_model_version',
    type: 'varchar',
    length: 60,
    nullable: true,
  })
  antiSpoofingModelVersion: string | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(
    () => AttendanceSessionEntity,
    (attendanceSession) => attendanceSession.recognitionEvents,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'session_id' })
  session: AttendanceSessionEntity;

  @ManyToOne(() => FileEntity, (file) => file.recognitionEvents, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'image_file_id' })
  imageFile: FileEntity | null;

  @ManyToOne(() => UserEntity, (user) => user.recognitionEvents, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'detected_student_id' })
  detectedStudent: UserEntity | null;

  @ManyToOne(() => FaceEmbeddingEntity, undefined, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'matched_embedding_id' })
  matchedEmbedding: FaceEmbeddingEntity | null;
}

