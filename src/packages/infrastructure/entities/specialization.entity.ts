import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { DepartmentEntity } from './department.entity';
import { UserEntity } from './user.entity';

@Entity('specializations')
@Unique('UQ_specializations_department_code', ['departmentId', 'code'])
export class SpecializationEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'department_id', type: 'int' })
  departmentId: number;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'code', type: 'varchar', length: 100 })
  code: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(
    () => DepartmentEntity,
    (department) => department.specializations,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity;

  @OneToMany(() => UserEntity, (user) => user.specialization)
  users: UserEntity[];
}

