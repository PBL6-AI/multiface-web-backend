import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateNotificationUseCase } from '../../application/use-cases/create-notification.use-case';
import { ListUserNotificationsUseCase } from '../../application/use-cases/list-user-notifications.use-case';
import { MarkNotificationAsReadUseCase } from '../../application/use-cases/mark-notification-as-read.use-case';
import { CreateNotificationDto } from '../dtos/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly listUserNotificationsUseCase: ListUserNotificationsUseCase,
    private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase,
  ) {}

  @Post()
  create(@Body() body: CreateNotificationDto) {
    return this.createNotificationUseCase.execute(body);
  }

  @Get('users/:userId')
  listByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.listUserNotificationsUseCase.execute(userId);
  }

  @Patch(':notificationId/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(
    @Param('notificationId', ParseIntPipe) notificationId: number,
  ): Promise<void> {
    await this.markNotificationAsReadUseCase.execute(notificationId);
  }
}
