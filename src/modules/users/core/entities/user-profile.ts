export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  avatarFileId: number | null;
  departmentId: number | null;
  specializationId: number | null;
}
