import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  aiConfig,
  databaseConfig,
  envConfig,
  queueConfig,
  storageConfig,
} from './config';
import { typeOrmConfig } from './database';
import {
  AttendanceModule,
  AuthModule,
  ClassesModule,
  EdgeDevicesModule,
  FacesModule,
  FilesModule,
  UsersModule,
} from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig, databaseConfig, storageConfig, aiConfig, queueConfig],
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    ClassesModule,
    UsersModule,
    AuthModule,
    FilesModule,
    FacesModule,
    EdgeDevicesModule,
    AttendanceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
