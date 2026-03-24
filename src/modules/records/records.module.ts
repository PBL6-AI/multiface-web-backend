import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants/repository.tokens';
import { AttendanceRecordEntity } from '../../infrastructure/persistence/typeorm/entities';
import { GetSessionRecordsUseCase } from './application/use-cases/get-session-records.use-case';
import { GetStudentAttendanceSummaryUseCase } from './application/use-cases/get-student-attendance-summary.use-case';
import { RecordsTypeOrmRepository } from './infrastructure/persistence/records.typeorm.repository';
import { RecordsController } from './presentation/controllers/records.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceRecordEntity])],
  controllers: [RecordsController],
  providers: [
    GetSessionRecordsUseCase,
    GetStudentAttendanceSummaryUseCase,
    {
      provide: REPOSITORY_TOKENS.RECORDS,
      useClass: RecordsTypeOrmRepository,
    },
  ],
})
export class RecordsModule {}
