import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants';
import { FileEntity } from '../../packages/infrastructure/entities';
import { useFilesRepository } from '../../packages/infrastructure/repositories';
import { StorageModule } from '../storage';
import { FilesController } from './controllers';
import { FilesService } from './services';
import { UsersModule } from '../users';

@Module({
  imports: [UsersModule, StorageModule, TypeOrmModule.forFeature([FileEntity])],
  controllers: [FilesController],
  providers: [FilesService, useFilesRepository()],
  exports: [FilesService, REPOSITORY_TOKENS.FILES],
})
export class FilesModule {}
