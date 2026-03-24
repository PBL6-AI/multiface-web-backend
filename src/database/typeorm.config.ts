import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import databaseConfig from '../config/database.config';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  useFactory: () => {
    const db = databaseConfig();

    return {
      type: 'postgres',
      host: db.host,
      port: db.port,
      username: db.username,
      password: db.password,
      database: db.database,
      autoLoadEntities: true,
      synchronize: db.synchronize,
    };
  },
};
