import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants/repository.tokens';
import {
  FaceEmbeddingEntity,
  FaceImageEntity,
  FaceRegistrationRequestEntity,
} from '../../infrastructure/persistence/typeorm/entities';
import { ReviewFaceImageUseCase } from './application/use-cases/review-face-image.use-case';
import { SubmitFaceImageUseCase } from './application/use-cases/submit-face-image.use-case';
import { AiFaceService } from './infrastructure/external/ai-face.service';
import { FacesTypeOrmRepository } from './infrastructure/persistence/faces.typeorm.repository';
import { FacesController } from './presentation/controllers/faces.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FaceRegistrationRequestEntity,
      FaceImageEntity,
      FaceEmbeddingEntity,
    ]),
  ],
  controllers: [FacesController],
  providers: [
    SubmitFaceImageUseCase,
    ReviewFaceImageUseCase,
    AiFaceService,
    {
      provide: REPOSITORY_TOKENS.FACES,
      useClass: FacesTypeOrmRepository,
    },
  ],
})
export class FacesModule {}
