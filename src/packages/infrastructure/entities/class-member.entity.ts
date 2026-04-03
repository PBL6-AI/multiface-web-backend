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
import { UserEntity } from './user.entity';

@Entity('class_members')
@Unique('UQ_class_members_class_student', ['classId', 'studentId'])
@Index('IDX_class_members_student_id', ['studentId'])
export class ClassMemberEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'class_id', type: 'int' })
  classId: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @CreateDateColumn({ name: 'joined_at', type: 'timestamp' })
  joinedAt: Date;

  @ManyToOne(() => ClassEntity, (classEntity) => classEntity.classMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'class_id' })
  classEntity: ClassEntity;

  @ManyToOne(() => UserEntity, (user) => user.classMemberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: UserEntity;
}

