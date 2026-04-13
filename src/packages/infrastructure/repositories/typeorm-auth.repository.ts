import { getRepositoryToken } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../../common/constants';
import { IsNull, Repository } from 'typeorm';
import type {
  AuthRepository,
  CreateRefreshTokenRecordInput,
} from '../../domain/repositories';
import { RefreshTokenEntity } from '../entities';

export class TypeOrmAuthRepository implements AuthRepository {
  constructor(
    private readonly refreshTokensRepository: Repository<RefreshTokenEntity>,
  ) {}

  async createRefreshToken(
    input: CreateRefreshTokenRecordInput,
  ): Promise<RefreshTokenEntity> {
    return this.refreshTokensRepository.save(
      this.refreshTokensRepository.create(input),
    );
  }

  async findRefreshTokensByUserId(
    userId: number,
    options?: { onlyActive?: boolean },
  ): Promise<RefreshTokenEntity[]> {
    const where = options?.onlyActive
      ? { userId, revokedAt: IsNull() }
      : { userId };

    return this.refreshTokensRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async revokeRefreshTokenById(refreshTokenId: number): Promise<void> {
    await this.refreshTokensRepository.update(refreshTokenId, {
      revokedAt: new Date(),
    });
  }

  async revokeActiveRefreshTokensByUserId(userId: number): Promise<void> {
    await this.refreshTokensRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }
}

export const useAuthRepository = () => ({
  provide: REPOSITORY_TOKENS.AUTH,
  useFactory: (refreshTokensRepository: Repository<RefreshTokenEntity>) =>
    new TypeOrmAuthRepository(refreshTokensRepository),
  inject: [getRepositoryToken(RefreshTokenEntity)],
});
