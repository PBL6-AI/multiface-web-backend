import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApprovalStatus } from './enums';
import { AttendanceRecordEntity } from './attendance-record.entity';
import { AttendanceSessionEntity } from './attendance-session.entity';
import { FileEntity } from './file.entity';
import { UserEntity } from './user.entity';

@Entity('appeals')
@Index('IDX_appeals_student_status_created', [
  'studentId',
  'status',
  'createdAt',
])
@Index('IDX_appeals_attendance_record_id', ['attendanceRecordId'])
export class AppealEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'session_id', type: 'int' })
  sessionId: number;

  @Column({ name: 'attendance_record_id', type: 'int', nullable: true })
  attendanceRecordId: number | null;

  @Column({ name: 'reason', type: 'text' })
  reason: string;

  @Column({ name: 'evidence_file_id', type: 'int', nullable: true })
  evidenceFileId: number | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @Column({ name: 'reviewed_by', type: 'int', nullable: true })
  reviewedById: number | null;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.appeals, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: UserEntity;

  @ManyToOne(
    () => AttendanceSessionEntity,
    (attendanceSession) => attendanceSession.appeals,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'session_id' })
  session: AttendanceSessionEntity;

  @ManyToOne(() => AttendanceRecordEntity, undefined, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'attendance_record_id' })
  attendanceRecord: AttendanceRecordEntity | null;

  @ManyToOne(() => FileEntity, (file) => file.appealEvidence, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'evidence_file_id' })
  evidenceFile: FileEntity | null;

  @ManyToOne(() => UserEntity, (user) => user.reviewedAppeals, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy: UserEntity | null;
}
