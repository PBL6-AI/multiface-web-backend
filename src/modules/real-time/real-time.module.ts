import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants/repository.tokens';
import { AttendanceRecordEntity } from '../../infrastructure/persistence/typeorm/entities';
import { GetSessionLiveDataUseCase } from './application/use-cases/get-session-live-data.use-case';
import { RealTimeTypeOrmRepository } from './infrastructure/persistence/real-time.typeorm.repository';
import { RealTimeController } from './presentation/controllers/real-time.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceRecordEntity])],
  controllers: [RealTimeController],
  providers: [
    GetSessionLiveDataUseCase,
    {
      provide: REPOSITORY_TOKENS.REAL_TIME,
      useClass: RealTimeTypeOrmRepository,
    },
  ],
})
export class RealTimeModule {}
