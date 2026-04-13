import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig, envConfig } from './config';
import { typeOrmConfig } from './database';
import { AuthModule, ClassesModule, FacesModule, UsersModule } from './modules';

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
