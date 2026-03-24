import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants/repository.tokens';
import { NotificationEntity } from '../../infrastructure/persistence/typeorm/entities';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { ListUserNotificationsUseCase } from './application/use-cases/list-user-notifications.use-case';
import { MarkNotificationAsReadUseCase } from './application/use-cases/mark-notification-as-read.use-case';
import { NotificationsTypeOrmRepository } from './infrastructure/persistence/notifications.typeorm.repository';
import { NotificationsController } from './presentation/controllers/notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  controllers: [NotificationsController],
  providers: [
    CreateNotificationUseCase,
    ListUserNotificationsUseCase,
    MarkNotificationAsReadUseCase,
    {
      provide: REPOSITORY_TOKENS.NOTIFICATIONS,
      useClass: NotificationsTypeOrmRepository,
    },
  ],
})
export class NotificationsModule {}
