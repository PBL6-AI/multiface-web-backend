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
import { AttendanceSessionEntity } from './attendance-session.entity';
import { ClassEntity } from './class.entity';
import { FileEntity } from './file.entity';
import { UserEntity } from './user.entity';

@Entity('leave_requests')
@Index('IDX_leave_requests_student_status_created', [
  'studentId',
  'status',
  'createdAt',
])
@Index('IDX_leave_requests_class_session', ['classId', 'sessionId'])
export class LeaveRequestEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'class_id', type: 'int' })
  classId: number;

  @Column({ name: 'session_id', type: 'int', nullable: true })
  sessionId: number | null;

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

  @ManyToOne(() => UserEntity, (user) => user.leaveRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: UserEntity;

  @ManyToOne(() => ClassEntity, (classEntity) => classEntity.leaveRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'class_id' })
  classEntity: ClassEntity;

  @ManyToOne(
    () => AttendanceSessionEntity,
    (attendanceSession) => attendanceSession.leaveRequests,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  @JoinColumn({ name: 'session_id' })
  session: AttendanceSessionEntity | null;

  @ManyToOne(() => FileEntity, (file) => file.leaveRequestEvidence, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'evidence_file_id' })
  evidenceFile: FileEntity | null;

  @ManyToOne(() => UserEntity, (user) => user.reviewedLeaveRequests, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy: UserEntity | null;
}

