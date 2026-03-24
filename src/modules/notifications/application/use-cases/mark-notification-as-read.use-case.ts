import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import type { INotificationsRepository } from '../../core/interfaces/notifications.repository.interface';

@Injectable()
export class MarkNotificationAsReadUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.NOTIFICATIONS)
    private readonly notificationsRepository: INotificationsRepository,
  ) {}

  execute(notificationId: number): Promise<void> {
    return this.notificationsRepository.markAsRead(notificationId);
  }
}
