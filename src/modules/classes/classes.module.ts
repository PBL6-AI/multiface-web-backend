import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants/repository.tokens';
import { ClassEntity } from '../../packages/infrastructure/entities/class.entity';
import { ClassMemberEntity } from '../../packages/infrastructure/entities/class-member.entity';
import { ClassScheduleEntity } from '../../packages/infrastructure/entities/class-schedule.entity';
import { TypeOrmClassesRepository } from '../../packages/infrastructure/repositories';
import { UserEntity } from '../../packages/infrastructure/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ClassesController } from './controllers/classes.controller';
import { ClassesService } from './services/classes.service';

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
  providers: [
    ClassesService,
    TypeOrmClassesRepository,
    {
      provide: REPOSITORY_TOKENS.CLASSES,
      useExisting: TypeOrmClassesRepository,
    },
  ],
  exports: [ClassesService, REPOSITORY_TOKENS.CLASSES],
})
export class ClassesModule {}
