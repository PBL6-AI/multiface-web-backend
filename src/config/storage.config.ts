import { registerAs } from '@nestjs/config';

export interface StorageConfig {
  provider: 's3';
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export default registerAs(
  'storage',
  (): StorageConfig => ({
    provider: 's3',
    region: process.env.AWS_REGION ?? 'ap-southeast-1',
    bucket: process.env.AWS_S3_BUCKET ?? '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  }),
);
