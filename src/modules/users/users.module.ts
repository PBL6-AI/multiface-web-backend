import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants';
import { useUsersRepository } from '../../packages/infrastructure/repositories';
import { StorageModule } from '../storage';
import {
  DepartmentEntity,
  FileEntity,
  RoleEntity,
  SpecializationEntity,
  UserEntity,
} from '../../packages/infrastructure/entities';
import { UsersController } from './controllers';
import { UsersService } from './services';

@Module({
  imports: [
    StorageModule,
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
