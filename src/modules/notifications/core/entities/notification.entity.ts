export interface Notification {
  id: number;
  userId: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}
