import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants';
import {
  FaceImageEntity,
  FaceRegistrationRequestEntity,
} from '../../packages/infrastructure/entities';
import { useFacesRepository } from '../../packages/infrastructure/repositories';
import { FilesModule } from '../files';
import { FacesController } from './controllers';
import { FacesService } from './services';
import { UsersModule } from '../users';

@Module({
  imports: [
    UsersModule,
    FilesModule,
    TypeOrmModule.forFeature([FaceRegistrationRequestEntity, FaceImageEntity]),
  ],
  controllers: [FacesController],
  providers: [FacesService, useFacesRepository()],
  exports: [FacesService, REPOSITORY_TOKENS.FACES],
})
export class FacesModule {}
