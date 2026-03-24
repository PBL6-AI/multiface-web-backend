import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { typeOrmConfig } from './database/typeorm.config';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClassesModule } from './modules/classes/classes.module';
import { ExceptionsModule } from './modules/exceptions/exceptions.module';
import { FacesModule } from './modules/faces/faces.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RealTimeModule } from './modules/real-time/real-time.module';
import { RecordsModule } from './modules/records/records.module';
import { RequestsModule } from './modules/requests/requests.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    AuthModule,
    UsersModule,
    ClassesModule,
    FacesModule,
    AttendanceModule,
    RealTimeModule,
    RecordsModule,
    ExceptionsModule,
    RequestsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
