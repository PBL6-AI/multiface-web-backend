import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EdgeDeviceEntity } from '../../packages/infrastructure/entities';
import { EdgeDevicesController } from './controllers';
import { EdgeDevicesService } from './services';
import { UsersModule } from '../users';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([EdgeDeviceEntity])],
  controllers: [EdgeDevicesController],
  providers: [EdgeDevicesService],
  exports: [EdgeDevicesService],
})
export class EdgeDevicesModule {}
