import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { aiConfig, databaseConfig, envConfig, storageConfig } from './config';
import { typeOrmConfig } from './database';
import {
  AttendanceModule,
  AuthModule,
  ClassesModule,
  FacesModule,
  FilesModule,
  UsersModule,
} from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig, databaseConfig, storageConfig, aiConfig],
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    ClassesModule,
    UsersModule,
    AuthModule,
    FilesModule,
    FacesModule,
    AttendanceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
