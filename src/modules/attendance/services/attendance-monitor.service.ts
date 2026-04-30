import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AI_PROVIDER_TOKEN } from '../../ai-integration/ai.constants';
import { AttendanceSessionStatus } from '../../../common/domain/enums';
import { REPOSITORY_TOKENS } from '../../../common/constants';
import type { AttendanceRepository } from '../../../packages/domain';
import type { FaceAiProvider } from '../../ai-integration/interfaces/face-ai-provider.interface';

@Injectable()
export class AttendanceMonitorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AttendanceMonitorService.name);
  private monitorInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly attendanceService: AttendanceService,
    @Inject(REPOSITORY_TOKENS.ATTENDANCE)
    private readonly attendanceRepository: AttendanceRepository,
    @Inject(AI_PROVIDER_TOKEN)
    private readonly faceAiProvider: FaceAiProvider,
  ) {}

  onModuleInit() {
    // Kiểm tra định kỳ mỗi 30 giây
    this.monitorInterval = setInterval(() => this.checkActiveSessions(), 30000);
    this.logger.log('Attendance monitor service initialized (Interval: 30s)');
  }

  onModuleDestroy() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
  }

  private async checkActiveSessions() {
    try {
      const sessions = await this.attendanceRepository.listSessions();
      const activeSessions = sessions.filter(
        (s) => s.status === AttendanceSessionStatus.ACTIVE,
      );

      if (activeSessions.length === 0) {
        return;
      }

      this.logger.debug(`Checking ${activeSessions.length} active sessions...`);

      const aiStatus = await this.faceAiProvider.getAttendanceStatus();

      if (!aiStatus.is_running) {
        this.logger.warn(
          'AI Service pipeline is NOT running but there are active sessions. Attempting to restart...',
        );

        // Lấy session ID đầu tiên để restart (giả định dùng chung 1 pipeline)
        const sessionId = activeSessions[0].id;
        await this.faceAiProvider.startAttendanceSession(sessionId);
        this.logger.log(
          `Restart signal sent to AI Service for Session ID: ${sessionId}`,
        );
      }
    } catch (error) {
      this.logger.error('Error in active sessions monitor:', error);
    }
  }
}
