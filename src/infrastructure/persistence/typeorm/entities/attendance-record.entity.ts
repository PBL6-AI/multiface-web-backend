import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AttendanceRecordStatus } from './enums';
import { AttendanceSessionEntity } from './attendance-session.entity';
import { FileEntity } from './file.entity';
import { UserEntity } from './user.entity';

@Entity('attendance_records')
export class AttendanceRecordEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'session_id', type: 'int' })
  sessionId: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AttendanceRecordStatus,
    default: AttendanceRecordStatus.PENDING,
  })
  status: AttendanceRecordStatus;

  @Column({ name: 'confidence_score', type: 'float', nullable: true })
  confidenceScore: number | null;

  @Column({ name: 'image_file_id', type: 'int', nullable: true })
  imageFileId: number | null;

  @CreateDateColumn({ name: 'recorded_at', type: 'datetime' })
  recordedAt: Date;

  @ManyToOne(
    () => AttendanceSessionEntity,
    (attendanceSession) => attendanceSession.records,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'session_id' })
  session: AttendanceSessionEntity;

  @ManyToOne(() => UserEntity, (user) => user.attendanceRecords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: UserEntity;

  @ManyToOne(() => FileEntity, (file) => file.attendanceRecords, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'image_file_id' })
  imageFile: FileEntity | null;
}
