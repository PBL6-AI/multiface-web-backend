import { UserProfile } from '../entities/user-profile';

export interface IUsersRepository {
  findProfileById(userId: number): Promise<UserProfile | null>;
  updateProfile(
    userId: number,
    data: Partial<Pick<UserProfile, 'fullName' | 'phone' | 'avatarFileId'>>,
  ): Promise<UserProfile | null>;
}
