import { AuthUser } from '../entities/auth-user';

export interface IAuthRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
  findById(userId: number): Promise<AuthUser | null>;
  saveRefreshToken(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  revokeRefreshToken(token: string): Promise<void>;
}
