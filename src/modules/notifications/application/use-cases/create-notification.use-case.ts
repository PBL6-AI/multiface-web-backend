import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import type { Notification } from '../../core/entities';
import type { INotificationsRepository } from '../../core/interfaces/notifications.repository.interface';

interface CreateNotificationInput {
  userId: number;
  title: string;
  content: string;
}

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.NOTIFICATIONS)
    private readonly notificationsRepository: INotificationsRepository,
  ) {}

  execute(input: CreateNotificationInput): Promise<Notification> {
    return this.notificationsRepository.createNotification(input);
  }
}
