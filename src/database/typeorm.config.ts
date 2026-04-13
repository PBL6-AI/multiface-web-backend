import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { join } from 'path';
import type { DatabaseConfig } from '../config';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const databaseConfig = configService.getOrThrow<DatabaseConfig>('database');

    return {
      type: 'postgres',
      host: databaseConfig.host,
      port: databaseConfig.port,
      username: databaseConfig.username,
      password: databaseConfig.password,
      database: databaseConfig.database,
      entities: [
        join(
          __dirname,
          '..',
          'packages',
          'infrastructure',
          'entities',
          '*.entity.{js,ts}',
        ),
      ],
      autoLoadEntities: true,
      synchronize: databaseConfig.synchronize,
    };
  },
};
