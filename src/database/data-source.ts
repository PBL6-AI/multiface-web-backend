import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'multiface',
  ssl:
    (process.env.DB_SSL ?? 'false') === 'true'
      ? { rejectUnauthorized: false }
      : false,
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
  migrations: [
    join(
      __dirname,
      '..',
      'packages',
      'infrastructure',
      'migration',
      '*.{js,ts}',
    ),
  ],
  synchronize: false,
});
