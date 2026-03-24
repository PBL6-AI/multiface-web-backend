import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants/repository.tokens';
import {
  AttendanceRecordEntity,
  AttendanceSessionEntity,
  RecognitionEventEntity,
} from '../../infrastructure/persistence/typeorm/entities';
import { ProcessRecognitionUseCase } from './application/use-cases/process-recognition.use-case';
import { StartAttendanceSessionUseCase } from './application/use-cases/start-attendance-session.use-case';
import { AttendanceTypeOrmRepository } from './infrastructure/persistence/attendance.typeorm.repository';
import { AttendanceController } from './presentation/controllers/attendance.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceSessionEntity,
      RecognitionEventEntity,
      AttendanceRecordEntity,
    ]),
  ],
  controllers: [AttendanceController],
  providers: [
    StartAttendanceSessionUseCase,
    ProcessRecognitionUseCase,
    {
      provide: REPOSITORY_TOKENS.ATTENDANCE,
      useClass: AttendanceTypeOrmRepository,
    },
  ],
  exports: [StartAttendanceSessionUseCase, ProcessRecognitionUseCase],
})
export class AttendanceModule {}
