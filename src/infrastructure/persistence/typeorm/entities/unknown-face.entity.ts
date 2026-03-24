import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AttendanceSessionEntity } from './attendance-session.entity';
import { FileEntity } from './file.entity';

@Entity('unknown_faces')
export class UnknownFaceEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'session_id', type: 'int' })
  sessionId: number;

  @Column({ name: 'frame_id', type: 'varchar', length: 120 })
  frameId: string;

  @Column({ name: 'image_file_id', type: 'int' })
  imageFileId: number;

  @CreateDateColumn({ name: 'detected_at', type: 'datetime' })
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
