import { NotificationEntity } from '../../../../../infrastructure/persistence/typeorm/entities';
import type { Notification } from '../../../core/entities';

export class NotificationsMapper {
  static toNotification(notification: NotificationEntity): Notification {
    return {
      id: notification.id,
      userId: notification.userId,
      title: notification.title,
      content: notification.content,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }
}
