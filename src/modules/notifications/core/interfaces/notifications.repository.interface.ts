import type { Notification } from '../entities';

export interface INotificationsRepository {
  createNotification(data: {
    userId: number;
    title: string;
    content: string;
  }): Promise<Notification>;
  listUserNotifications(userId: number): Promise<Notification[]>;
  markAsRead(notificationId: number): Promise<void>;
}
