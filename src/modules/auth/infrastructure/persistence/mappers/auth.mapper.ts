import { UserEntity } from '../../../../../infrastructure/persistence/typeorm/entities';
import { AuthUser } from '../../../core/entities/auth-user';

export class AuthMapper {
  static toDomain(user: UserEntity): AuthUser | null {
    if (!user.role) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      passwordHash: user.passwordHash,
      role: user.role.name,
    };
  }
}
