export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  passwordHash: string;
  role: string;
}
