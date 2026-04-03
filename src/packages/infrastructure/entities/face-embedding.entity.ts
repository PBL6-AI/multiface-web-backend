import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import {
  EDGEFACE_DEFAULT_MODEL,
  EDGEFACE_DEFAULT_MODEL_VERSION,
  EDGEFACE_DEFAULT_PREPROCESS_PROFILE,
  EDGEFACE_EMBEDDING_DIMENSION,
} from '../../../common/constants/ai-model.constants';
import { FaceImageEntity } from './face-image.entity';
import { UserEntity } from './user.entity';

@Entity('face_embeddings')
@Unique('UQ_face_embeddings_image_model_version', [
  'faceImageId',
  'modelName',
  'modelVersion',
])
@Index('IDX_face_embeddings_student_model_active', [
  'studentId',
  'modelName',
  'isActive',
])
export class FaceEmbeddingEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'face_image_id', type: 'int' })
  faceImageId: number;

  @Column({
    name: 'embedding',
    type: 'vector',
    length: EDGEFACE_EMBEDDING_DIMENSION,
  })
  embedding: number[];

  @Column({
    name: 'model_name',
    type: 'varchar',
    length: 120,
    default: EDGEFACE_DEFAULT_MODEL,
  })
  modelName: string;

  @Column({
    name: 'model_version',
    type: 'varchar',
    length: 60,
    default: EDGEFACE_DEFAULT_MODEL_VERSION,
  })
  modelVersion: string;

  @Column({
    name: 'distance_metric',
    type: 'varchar',
    length: 50,
    default: 'cosine',
  })
  distanceMetric: string;

  @Column({
    name: 'embedding_dimension',
    type: 'int',
    default: EDGEFACE_EMBEDDING_DIMENSION,
  })
  embeddingDimension: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    name: 'preprocess_profile',
    type: 'varchar',
    length: 100,
    default: EDGEFACE_DEFAULT_PREPROCESS_PROFILE,
  })
  preprocessProfile: string;

  @Column({ name: 'is_l2_normalized', type: 'boolean', default: true })
  isL2Normalized: boolean;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.faceEmbeddings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: UserEntity;

  @ManyToOne(() => FaceImageEntity, (faceImage) => faceImage.embeddings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'face_image_id' })
  faceImage: FaceImageEntity;
}

