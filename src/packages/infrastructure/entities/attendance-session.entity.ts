import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AttendanceSessionStatus, AttendanceType } from './enums';
import { AppealEntity } from './appeal.entity';
import { AttendanceRecordEntity } from './attendance-record.entity';
import { ClassEntity } from './class.entity';
import { LeaveRequestEntity } from './leave-request.entity';
import { RecognitionEventEntity } from './recognition-event.entity';
import { UnknownFaceEntity } from './unknown-face.entity';
import { UserEntity } from './user.entity';

@Entity('attendance_sessions')
@Index('IDX_attendance_sessions_class_start', ['classId', 'startTime'])
@Index('IDX_attendance_sessions_status', ['status'])
export class AttendanceSessionEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'class_id', type: 'int' })
  classId: number;

  @Column({ name: 'created_by', type: 'int' })
  createdById: number;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  endTime: Date | null;

  @Column({
    name: 'attendance_type',
    type: 'enum',
    enum: AttendanceType,
    default: AttendanceType.AUTOMATIC,
  })
  attendanceType: AttendanceType;

  @Column({ name: 'confidence_threshold', type: 'float', nullable: true })
  confidenceThreshold: number | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AttendanceSessionStatus,
    default: AttendanceSessionStatus.ACTIVE,
  })
  status: AttendanceSessionStatus;

  @ManyToOne(
    () => ClassEntity,
    (classEntity) => classEntity.attendanceSessions,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'class_id' })
  classEntity: ClassEntity;

  @ManyToOne(() => UserEntity, (user) => user.createdAttendanceSessions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: UserEntity;

  @OneToMany(
    () => AttendanceRecordEntity,
    (attendanceRecord) => attendanceRecord.session,
  )
  records: AttendanceRecordEntity[];

  @OneToMany(
    () => RecognitionEventEntity,
    (recognitionEvent) => recognitionEvent.session,
  )
  recognitionEvents: RecognitionEventEntity[];

  @OneToMany(() => UnknownFaceEntity, (unknownFace) => unknownFace.session)
  unknownFaces: UnknownFaceEntity[];

  @OneToMany(() => LeaveRequestEntity, (leaveRequest) => leaveRequest.session)
  leaveRequests: LeaveRequestEntity[];

  @OneToMany(() => AppealEntity, (appeal) => appeal.session)
  appeals: AppealEntity[];
}

