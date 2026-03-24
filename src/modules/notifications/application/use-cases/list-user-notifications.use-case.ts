import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import type { Notification } from '../../core/entities';
import type { INotificationsRepository } from '../../core/interfaces/notifications.repository.interface';

@Injectable()
export class ListUserNotificationsUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.NOTIFICATIONS)
    private readonly notificationsRepository: INotificationsRepository,
  ) {}

  execute(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.listUserNotifications(userId);
  }
}
