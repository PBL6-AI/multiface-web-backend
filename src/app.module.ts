import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig, envConfig, storageConfig } from './config';
import { typeOrmConfig } from './database';
import {
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
      load: [envConfig, databaseConfig, storageConfig],
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    ClassesModule,
    UsersModule,
    AuthModule,
    FilesModule,
    FacesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
