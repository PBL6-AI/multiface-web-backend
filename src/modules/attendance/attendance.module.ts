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
import { AttendanceService, AttendanceMonitorService } from './services';
import { UsersModule } from '../users';
import { FacesModule } from '../faces';
import { AiIntegrationModule } from '../ai-integration';
import { EdgeDevicesModule } from '../edge-devices';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    FacesModule,
    AiIntegrationModule,
    EdgeDevicesModule,
    TypeOrmModule.forFeature([
      AttendanceSessionEntity,
      AttendanceRecordEntity,
      RecognitionEventEntity,
      ClassEntity,
    ]),
  ],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttendanceMonitorService,
    useAttendanceRepository(),
  ],
  exports: [AttendanceService, REPOSITORY_TOKENS.ATTENDANCE],
})
export class AttendanceModule {}
