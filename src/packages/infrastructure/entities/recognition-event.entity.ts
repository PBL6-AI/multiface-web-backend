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
import { UserEntity } from './user.entity';

@Entity('recognition_events')
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

  @Column({ name: 'confidence_score', type: 'float', nullable: true })
  confidenceScore: number | null;

  @Column({ name: 'is_real_face', type: 'boolean', default: true })
  isRealFace: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
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
}
