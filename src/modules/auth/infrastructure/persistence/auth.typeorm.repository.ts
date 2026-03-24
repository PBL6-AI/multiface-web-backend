import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  RefreshTokenEntity,
  UserEntity,
} from '../../../../infrastructure/persistence/typeorm/entities';
import { AuthUser } from '../../core/entities/auth-user';
import { IAuthRepository } from '../../core/interfaces/auth.repository.interface';
import { AuthMapper } from './mappers/auth.mapper';

@Injectable()
export class AuthTypeOrmRepository implements IAuthRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) {
      return null;
    }

    return AuthMapper.toDomain(user);
  }

  async findById(userId: number): Promise<AuthUser | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      return null;
    }

    return AuthMapper.toDomain(user);
  }

  async saveRefreshToken(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        userId,
        token,
        expiresAt,
      }),
    );
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update(
      {
        token,
        revokedAt: IsNull(),
      },
      {
        revokedAt: new Date(),
      },
    );
  }
}
