import type { RawUserEntity } from './user.raw-entity';

export interface RawNotificationEntity {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: string;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: Date;
  user: RawUserEntity;
}
