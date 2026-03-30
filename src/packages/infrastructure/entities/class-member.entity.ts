import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClassEntity } from './class.entity';
import { UserEntity } from './user.entity';

@Entity('class_members')
export class ClassMemberEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'class_id', type: 'int' })
  classId: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @CreateDateColumn({ name: 'joined_at', type: 'datetime' })
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
