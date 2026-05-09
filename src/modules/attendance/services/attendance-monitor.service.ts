import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { AttendanceSessionStatus } from '../../../common/domain/enums';
import { REPOSITORY_TOKENS } from '../../../common/constants';
import type { AttendanceRepository } from '../../../packages/domain';
import { AI_PROVIDER_TOKEN } from '../../ai-integration/ai.constants';
import type { FaceAiProvider } from '../../ai-integration/interfaces/face-ai-provider.interface';

@Injectable()
export class AttendanceMonitorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AttendanceMonitorService.name);
  private monitorInterval: NodeJS.Timeout | null = null;

  constructor(
    @Inject(REPOSITORY_TOKENS.ATTENDANCE)
    private readonly attendanceRepository: AttendanceRepository,
    @Inject(AI_PROVIDER_TOKEN)
    private readonly faceAiProvider: FaceAiProvider,
  ) {}

  onModuleInit() {
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

      const session = activeSessions[0];
      const aiStatus = await this.faceAiProvider.getAttendanceStatus();

      if (!aiStatus.is_running || aiStatus.sessionId !== session.id) {
        this.logger.warn(
          'AI Service pipeline is missing or bound to another session while attendance is active. Attempting to restart...',
        );

        await this.faceAiProvider.startAttendanceSession({
          sessionId: session.id,
          sourceDeviceId: session.sourceDeviceId,
          cameraId: session.cameraId,
          videoSource: session.videoSource,
          confidenceThreshold: session.confidenceThreshold,
        });
        this.logger.log(
          `Restart signal sent to AI Service for Session ID: ${session.id}`,
        );
      }
    } catch (error) {
      this.logger.error('Error in active sessions monitor:', error);
    }
  }
}
