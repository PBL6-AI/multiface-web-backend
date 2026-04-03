export interface UserResponseDto {
  id: number;
  fullName: string;
  userCode: string;
  email: string;
  phone: string | null;
  avatarFileId: number | null;
  departmentId: number | null;
  departmentName: string | null;
  specializationId: number | null;
  specializationName: string | null;
  roleId: number;
  role: string | null;
  createdAt: Date;
  updatedAt: Date;
}
