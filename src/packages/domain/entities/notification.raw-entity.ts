import type { RawUserEntity } from './user.raw-entity';

export interface RawNotificationEntity {
  id: number;
  userId: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  user: RawUserEntity;
}
