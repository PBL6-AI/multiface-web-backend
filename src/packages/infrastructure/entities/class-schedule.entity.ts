import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ClassEntity } from './class.entity';

@Entity('class_schedules')
@Unique('UQ_class_schedules_class_slot_room', [
  'classId',
  'dayOfWeek',
  'startTime',
  'endTime',
  'room',
])
@Index('IDX_class_schedules_class_id', ['classId'])
export class ClassScheduleEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'class_id', type: 'int' })
  classId: number;

  @Column({ name: 'day_of_week', type: 'int' })
  dayOfWeek: number;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'room', type: 'varchar', length: 100 })
  room: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => ClassEntity, (classEntity) => classEntity.schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'class_id' })
  classEntity: ClassEntity;
}
