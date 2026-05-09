import { registerAs } from '@nestjs/config';

export interface AiConfig {
  provider: 'mock' | 'http';
  baseUrl: string;
  attendanceControlUrl: string;
  timeoutMs: number;
  authToken: string;
}

export default registerAs(
  'ai',
  (): AiConfig => ({
    provider:
      process.env.AI_PROVIDER === 'http' || process.env.AI_PROVIDER === 'mock'
        ? process.env.AI_PROVIDER
        : 'mock',
    baseUrl: process.env.AI_BASE_URL ?? 'http://localhost:8000',
    attendanceControlUrl:
      process.env.AI_ATTENDANCE_CONTROL_URL ??
      process.env.AI_BASE_URL ??
      'http://localhost:8000',
    timeoutMs: Number(process.env.AI_TIMEOUT_MS ?? 15000),
    authToken: process.env.AI_AUTH_TOKEN ?? '',
  }),
);
