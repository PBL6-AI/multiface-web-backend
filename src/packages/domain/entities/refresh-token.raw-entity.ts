import type { RawUserEntity } from './user.raw-entity';

export interface RawRefreshTokenEntity {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  user: RawUserEntity;
}
