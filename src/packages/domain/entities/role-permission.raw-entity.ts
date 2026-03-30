import type { RawPermissionEntity } from './permission.raw-entity';
import type { RawRoleEntity } from './role.raw-entity';

export interface RawRolePermissionEntity {
  roleId: number;
  permissionId: number;
  createdAt: Date;
  role: RawRoleEntity;
  permission: RawPermissionEntity;
}
