import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { STORAGE_TOKENS } from './constants';
import { S3StorageService } from './services';

@Module({
  imports: [ConfigModule],
  providers: [
    S3StorageService,
    {
      provide: STORAGE_TOKENS.CLOUD_STORAGE,
      useExisting: S3StorageService,
    },
  ],
  exports: [STORAGE_TOKENS.CLOUD_STORAGE],
})
export class StorageModule {}
