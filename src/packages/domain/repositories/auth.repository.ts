import type { RawRefreshTokenEntity } from '../entities';

export type CreateRefreshTokenRecordInput = {
  userId: number;
  token: string;
  expiresAt: Date;
};

export interface AuthRepository {
  createRefreshToken(
    input: CreateRefreshTokenRecordInput,
  ): Promise<RawRefreshTokenEntity>;
  findRefreshTokensByUserId(
    userId: number,
    options?: { onlyActive?: boolean },
  ): Promise<RawRefreshTokenEntity[]>;
  revokeRefreshTokenById(refreshTokenId: number): Promise<void>;
  revokeActiveRefreshTokensByUserId(userId: number): Promise<void>;
}
