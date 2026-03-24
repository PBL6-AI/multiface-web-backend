import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants/repository.tokens';
import {
  AppealEntity,
  LeaveRequestEntity,
} from '../../infrastructure/persistence/typeorm/entities';
import { CreateAppealUseCase } from './application/use-cases/create-appeal.use-case';
import { CreateLeaveRequestUseCase } from './application/use-cases/create-leave-request.use-case';
import { ReviewRequestUseCase } from './application/use-cases/review-request.use-case';
import { RequestsTypeOrmRepository } from './infrastructure/persistence/requests.typeorm.repository';
import { RequestsController } from './presentation/controllers/requests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequestEntity, AppealEntity])],
  controllers: [RequestsController],
  providers: [
    CreateLeaveRequestUseCase,
    CreateAppealUseCase,
    ReviewRequestUseCase,
    {
      provide: REPOSITORY_TOKENS.REQUESTS,
      useClass: RequestsTypeOrmRepository,
    },
  ],
})
export class RequestsModule {}
