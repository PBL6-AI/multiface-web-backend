import type {
  RawDepartmentEntity,
  RawFileEntity,
  RawRoleEntity,
  RawSpecializationEntity,
  RawUserEntity,
} from '../entities';

export type CreateUserRecordInput = {
  fullName: string;
  userCode: string;
  email: string;
  passwordHash: string;
  roleId: number;
  phone: string | null;
  departmentId: number | null;
  specializationId: number | null;
  avatarFileId: number | null;
};

export type CreateRoleRecordInput = {
  name: string;
  description: string | null;
};

export interface UsersRepository {
  listUsers(roleName?: string): Promise<RawUserEntity[]>;
  findById(userId: number): Promise<RawUserEntity | null>;
  findByUserCode(userCode: string): Promise<RawUserEntity | null>;
  findByEmail(email: string): Promise<RawUserEntity | null>;
  create(input: CreateUserRecordInput): Promise<RawUserEntity>;
  save(user: RawUserEntity): Promise<RawUserEntity>;
  listRoles(): Promise<RawRoleEntity[]>;
  createRole(input: CreateRoleRecordInput): Promise<RawRoleEntity>;
  findRoleByName(roleName: string): Promise<RawRoleEntity | null>;
  findDepartmentById(departmentId: number): Promise<RawDepartmentEntity | null>;
  findSpecializationById(
    specializationId: number,
  ): Promise<RawSpecializationEntity | null>;
  findFileById(fileId: number): Promise<RawFileEntity | null>;
}
