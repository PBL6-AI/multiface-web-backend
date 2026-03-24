import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../../infrastructure/persistence/typeorm/entities';
import { UserProfile } from '../../core/entities/user-profile';
import { IUsersRepository } from '../../core/interfaces/users.repository.interface';
import { UsersMapper } from './mappers/users.mapper';

@Injectable()
export class UsersTypeOrmRepository implements IUsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findProfileById(userId: number): Promise<UserProfile | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return null;
    }

    return UsersMapper.toDomain(user);
  }

  async updateProfile(
    userId: number,
    data: Partial<Pick<UserProfile, 'fullName' | 'phone' | 'avatarFileId'>>,
  ): Promise<UserProfile | null> {
    await this.userRepository.update({ id: userId }, data);
    return this.findProfileById(userId);
  }
}
