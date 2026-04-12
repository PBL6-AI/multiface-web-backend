import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import envConfig from './config/env.config';
import { typeOrmConfig } from './database/typeorm.config';
import { ClassesModule } from './modules/classes/classes.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { FacesModule } from './modules/faces/faces.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig, databaseConfig],
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    ClassesModule,
    UsersModule,
    AuthModule,
    FacesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
