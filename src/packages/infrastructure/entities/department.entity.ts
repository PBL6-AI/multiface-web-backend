import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SpecializationEntity } from './specialization.entity';
import { UserEntity } from './user.entity';

@Entity('departments')
export class DepartmentEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'code', type: 'varchar', length: 100 })
  code: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @OneToMany(
    () => SpecializationEntity,
    (specialization) => specialization.department,
  )
  specializations: SpecializationEntity[];

  @OneToMany(() => UserEntity, (user) => user.department)
  users: UserEntity[];
}
