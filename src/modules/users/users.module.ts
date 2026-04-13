import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants/repository.tokens';
import { useUsersRepository } from '../../packages/infrastructure/repositories';
import { DepartmentEntity } from '../../packages/infrastructure/entities/department.entity';
import { FileEntity } from '../../packages/infrastructure/entities/file.entity';
import { RoleEntity } from '../../packages/infrastructure/entities/role.entity';
import { SpecializationEntity } from '../../packages/infrastructure/entities/specialization.entity';
import { UserEntity } from '../../packages/infrastructure/entities/user.entity';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      DepartmentEntity,
      SpecializationEntity,
      FileEntity,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, useUsersRepository()],
  exports: [UsersService, REPOSITORY_TOKENS.USERS],
})
export class UsersModule {}
