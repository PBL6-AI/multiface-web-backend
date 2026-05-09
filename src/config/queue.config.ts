import { registerAs } from '@nestjs/config';

export interface QueueConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  db: number;
  enrollmentQueueName: string;
}

export default registerAs(
  'queue',
  (): QueueConfig => ({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
    username: process.env.REDIS_USERNAME ?? '',
    password: process.env.REDIS_PASSWORD ?? '',
    db: Number(process.env.REDIS_DB ?? 0),
    enrollmentQueueName:
      process.env.ENROLLMENT_QUEUE_NAME ?? 'face-enrollment-processing',
  }),
);
