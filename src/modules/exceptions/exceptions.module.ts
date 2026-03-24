import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants/repository.tokens';
import {
  AttendanceRecordEntity,
  UnknownFaceEntity,
} from '../../infrastructure/persistence/typeorm/entities';
import { GetManualReviewQueueUseCase } from './application/use-cases/get-manual-review-queue.use-case';
import { ResolvePendingRecordUseCase } from './application/use-cases/resolve-pending-record.use-case';
import { ExceptionsTypeOrmRepository } from './infrastructure/persistence/exceptions.typeorm.repository';
import { ExceptionsController } from './presentation/controllers/exceptions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceRecordEntity, UnknownFaceEntity]),
  ],
  controllers: [ExceptionsController],
  providers: [
    GetManualReviewQueueUseCase,
    ResolvePendingRecordUseCase,
    {
      provide: REPOSITORY_TOKENS.EXCEPTIONS,
      useClass: ExceptionsTypeOrmRepository,
    },
  ],
})
export class ExceptionsModule {}
