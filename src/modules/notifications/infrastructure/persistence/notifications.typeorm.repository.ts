import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../../../../infrastructure/persistence/typeorm/entities';
import type { Notification } from '../../core/entities';
import { INotificationsRepository } from '../../core/interfaces/notifications.repository.interface';
import { NotificationsMapper } from './mappers/notifications.mapper';

@Injectable()
export class NotificationsTypeOrmRepository implements INotificationsRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  async createNotification(data: {
    userId: number;
    title: string;
    content: string;
  }): Promise<Notification> {
    const notification = await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: data.userId,
        title: data.title,
        content: data.content,
        isRead: false,
      }),
    );

    return NotificationsMapper.toNotification(notification);
  }

  async listUserNotifications(userId: number): Promise<Notification[]> {
    const notifications = await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return notifications.map((notification) =>
      NotificationsMapper.toNotification(notification),
    );
  }

  async markAsRead(notificationId: number): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId },
      { isRead: true },
    );
  }
}
