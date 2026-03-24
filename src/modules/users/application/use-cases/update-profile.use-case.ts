import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import { UserProfile } from '../../core/entities/user-profile';
import type { IUsersRepository } from '../../core/interfaces/users.repository.interface';

interface UpdateProfileInput {
  userId: number;
  fullName?: string;
  phone?: string;
  avatarFileId?: number;
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.USERS)
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(input: UpdateProfileInput): Promise<UserProfile> {
    const profile = await this.usersRepository.updateProfile(input.userId, {
      fullName: input.fullName,
      phone: input.phone,
      avatarFileId: input.avatarFileId,
    });

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    return profile;
  }
}
