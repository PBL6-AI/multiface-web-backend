import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants';
import {
  ClassEntity,
  ClassMemberEntity,
  ClassScheduleEntity,
  UserEntity,
} from '../../packages/infrastructure/entities';
import { useClassesRepository } from '../../packages/infrastructure/repositories';
import { AuthModule } from '../auth';
import { UsersModule } from '../users';
import { ClassesController } from './controllers';
import { ClassesService } from './services';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forFeature([
      ClassEntity,
      ClassMemberEntity,
      ClassScheduleEntity,
      UserEntity,
    ]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService, useClassesRepository()],
  exports: [ClassesService, REPOSITORY_TOKENS.CLASSES],
})
export class ClassesModule {}
