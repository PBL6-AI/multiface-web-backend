import type { RawRolePermissionEntity } from './role-permission.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawRoleEntity {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  users: RawUserEntity[];
  rolePermissions: RawRolePermissionEntity[];
}
