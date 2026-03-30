import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  useFactory: (configService: ConfigService) => {
    return {
      type: 'postgres',
      host: configService.get<string>('db.host'),
      port: configService.get<number>('db.port'),
      username: configService.get<string>('db.username'),
      password: configService.get<string>('db.password'),
      database: configService.get<string>('db.database'),
      autoLoadEntities: true,
      synchronize: configService.get<boolean>('db.synchronize'),
    };
  },
};
