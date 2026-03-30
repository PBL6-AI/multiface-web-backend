import type { RawDepartmentEntity } from './department.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawSpecializationEntity {
  id: number;
  departmentId: number;
  name: string;
  code: string;
  description: string | null;
  createdAt: Date;
  department: RawDepartmentEntity;
  users: RawUserEntity[];
}
