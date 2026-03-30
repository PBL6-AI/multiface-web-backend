import type { RawRolePermissionEntity } from './role-permission.raw-entity';

export interface RawPermissionEntity {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  rolePermissions: RawRolePermissionEntity[];
}
