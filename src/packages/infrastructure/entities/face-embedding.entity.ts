import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FaceImageEntity } from './face-image.entity';
import { UserEntity } from './user.entity';

@Entity('face_embeddings')
export class FaceEmbeddingEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'face_image_id', type: 'int' })
  faceImageId: number;

  @Column({ name: 'embedding', type: 'simple-json' })
  embedding: number[];

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
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
