import { UserEntity } from '../../../../../infrastructure/persistence/typeorm/entities';
import { UserProfile } from '../../../core/entities/user-profile';

export class UsersMapper {
  static toDomain(user: UserEntity): UserProfile {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatarFileId: user.avatarFileId,
      departmentId: user.departmentId,
      specializationId: user.specializationId,
    };
  }
}
