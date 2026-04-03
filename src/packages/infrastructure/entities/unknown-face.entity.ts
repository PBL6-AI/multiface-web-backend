import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { FaceBoundingBox } from '../../../common/types';
import { AttendanceSessionEntity } from './attendance-session.entity';
import { FileEntity } from './file.entity';

@Entity('unknown_faces')
@Index('IDX_unknown_faces_session_detected', ['sessionId', 'detectedAt'])
export class UnknownFaceEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'session_id', type: 'int' })
  sessionId: number;

  @Column({ name: 'frame_id', type: 'varchar', length: 120 })
  frameId: string;

  @Column({ name: 'image_file_id', type: 'int' })
  imageFileId: number;

  @Column({ name: 'anti_spoofing_score', type: 'float', nullable: true })
  antiSpoofingScore: number | null;

  @Column({ name: 'bounding_box', type: 'jsonb', nullable: true })
  boundingBox: FaceBoundingBox | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'detected_at', type: 'timestamp' })
  detectedAt: Date;

  @ManyToOne(
    () => AttendanceSessionEntity,
    (attendanceSession) => attendanceSession.unknownFaces,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'session_id' })
  session: AttendanceSessionEntity;

  @ManyToOne(() => FileEntity, (file) => file.unknownFaces, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'image_file_id' })
  imageFile: FileEntity;
}

