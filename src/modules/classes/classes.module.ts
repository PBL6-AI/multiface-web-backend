import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants/repository.tokens';
import {
  ClassEntity,
  ClassMemberEntity,
} from '../../infrastructure/persistence/typeorm/entities';
import { CreateClassUseCase } from './application/use-cases/create-class.use-case';
import { JoinClassUseCase } from './application/use-cases/join-class.use-case';
import { ClassesTypeOrmRepository } from './infrastructure/persistence/classes.typeorm.repository';
import { ClassesController } from './presentation/controllers/classes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClassEntity, ClassMemberEntity])],
  controllers: [ClassesController],
  providers: [
    CreateClassUseCase,
    JoinClassUseCase,
    {
      provide: REPOSITORY_TOKENS.CLASSES,
      useClass: ClassesTypeOrmRepository,
    },
  ],
  exports: [CreateClassUseCase, JoinClassUseCase],
})
export class ClassesModule {}
