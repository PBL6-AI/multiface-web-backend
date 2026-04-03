import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AttendanceSessionEntity } from './attendance-session.entity';
import { ClassMemberEntity } from './class-member.entity';
import { ClassScheduleEntity } from './class-schedule.entity';
import { LeaveRequestEntity } from './leave-request.entity';
import { UserEntity } from './user.entity';

@Entity('classes')
@Unique('UQ_classes_class_code', ['classCode'])
@Index('IDX_classes_teacher_id', ['teacherId'])
export class ClassEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'class_name', type: 'varchar', length: 255 })
  className: string;

  @Column({ name: 'class_code', type: 'varchar', length: 100 })
  classCode: string;

  @Column({ name: 'teacher_id', type: 'int' })
  teacherId: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.taughtClasses, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: UserEntity;

  @OneToMany(() => ClassMemberEntity, (classMember) => classMember.classEntity)
  classMembers: ClassMemberEntity[];

  @OneToMany(
    () => ClassScheduleEntity,
    (classSchedule) => classSchedule.classEntity,
  )
  schedules: ClassScheduleEntity[];

  @OneToMany(
    () => AttendanceSessionEntity,
    (attendanceSession) => attendanceSession.classEntity,
  )
  attendanceSessions: AttendanceSessionEntity[];

  @OneToMany(
    () => LeaveRequestEntity,
    (leaveRequest) => leaveRequest.classEntity,
  )
  leaveRequests: LeaveRequestEntity[];
}
