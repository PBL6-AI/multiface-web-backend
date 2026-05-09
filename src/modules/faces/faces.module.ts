import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants';
import queueConfig from '../../config/queue.config';
import {
  EnrollmentSessionEntity,
  FaceEmbeddingEntity,
  FaceImageEntity,
  FaceRegistrationRequestEntity,
  PrototypeEmbeddingEntity,
} from '../../packages/infrastructure/entities';
import { useFacesRepository } from '../../packages/infrastructure/repositories';
import { AiIntegrationModule } from '../ai-integration';
import { FilesModule } from '../files';
import { EnrollmentController } from './controllers';
import {
  EnrollmentProcessingWorkerService,
  EnrollmentQueueService,
  EnrollmentService,
} from './services';
import { UsersModule } from '../users';

@Module({
  imports: [
    ConfigModule.forFeature(queueConfig),
    AiIntegrationModule,
    UsersModule,
    FilesModule,
    TypeOrmModule.forFeature([
      EnrollmentSessionEntity,
      FaceRegistrationRequestEntity,
      FaceImageEntity,
      FaceEmbeddingEntity,
      PrototypeEmbeddingEntity,
    ]),
  ],
  controllers: [EnrollmentController],
  providers: [
    EnrollmentService,
    EnrollmentProcessingWorkerService,
    EnrollmentQueueService,
    useFacesRepository(),
  ],
  exports: [EnrollmentService, REPOSITORY_TOKENS.FACES],
})
export class FacesModule {}
