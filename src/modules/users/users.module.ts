import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants/repository.tokens';
import { UserEntity } from '../../infrastructure/persistence/typeorm/entities';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { UsersTypeOrmRepository } from './infrastructure/persistence/users.typeorm.repository';
import { UsersController } from './presentation/controllers/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [
    GetProfileUseCase,
    UpdateProfileUseCase,
    {
      provide: REPOSITORY_TOKENS.USERS,
      useClass: UsersTypeOrmRepository,
    },
  ],
  exports: [GetProfileUseCase, UpdateProfileUseCase],
})
export class UsersModule {}
