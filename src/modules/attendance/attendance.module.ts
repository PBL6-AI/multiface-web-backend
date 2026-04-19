import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants';
import {
  AttendanceRecordEntity,
  AttendanceSessionEntity,
  ClassEntity,
  RecognitionEventEntity,
} from '../../packages/infrastructure/entities';
import { useAttendanceRepository } from '../../packages/infrastructure/repositories';
import { AuthModule } from '../auth';
import { AttendanceController } from './controllers';
import { AttendanceService } from './services';
import { UsersModule } from '../users';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    TypeOrmModule.forFeature([
      AttendanceSessionEntity,
      AttendanceRecordEntity,
      RecognitionEventEntity,
      ClassEntity,
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, useAttendanceRepository()],
  exports: [AttendanceService, REPOSITORY_TOKENS.ATTENDANCE],
})
export class AttendanceModule {}
