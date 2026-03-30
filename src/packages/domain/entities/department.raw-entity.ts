import type { RawSpecializationEntity } from './specialization.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawDepartmentEntity {
  id: number;
  name: string;
  code: string;
  description: string | null;
  createdAt: Date;
  specializations: RawSpecializationEntity[];
  users: RawUserEntity[];
}
