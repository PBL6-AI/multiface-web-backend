import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApprovalStatus } from './enums';
import { AttendanceSessionEntity } from './attendance-session.entity';
import { FileEntity } from './file.entity';
import { UserEntity } from './user.entity';

@Entity('appeals')
export class AppealEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'session_id', type: 'int' })
  sessionId: number;

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

  @Column({ name: 'reviewed_at', type: 'datetime', nullable: true })
  reviewedAt: Date | null;

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
