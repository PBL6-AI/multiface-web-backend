import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import { UseCase } from '../../../../common/interfaces/use-case.interface';
import { UserProfile } from '../../core/entities/user-profile';
import type { IUsersRepository } from '../../core/interfaces/users.repository.interface';

@Injectable()
export class GetProfileUseCase implements UseCase<number, UserProfile> {
  constructor(
    @Inject(REPOSITORY_TOKENS.USERS)
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(userId: number): Promise<UserProfile> {
    const profile = await this.usersRepository.findProfileById(userId);

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    return profile;
  }
}
