import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  EDGEFACE_DEFAULT_MODEL,
  EDGEFACE_DEFAULT_MODEL_VERSION,
  EDGEFACE_EMBEDDING_DIMENSION,
} from '../../../common/constants/ai-model.constants';
import { UserEntity } from './user.entity';

@Entity('prototype_embeddings')
export class PrototypeEmbeddingEntity {
  @PrimaryColumn({ name: 'student_id', type: 'int' })
  studentId: number;

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

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: UserEntity;
}
