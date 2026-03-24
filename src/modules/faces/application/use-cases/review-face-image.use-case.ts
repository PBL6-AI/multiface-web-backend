import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import { ApprovalStatus } from '../../../../common/domain/enums';
import type { IFacesRepository } from '../../core/interfaces/faces.repository.interface';
import { AiFaceService } from '../../infrastructure/external/ai-face.service';

interface ReviewFaceImageInput {
  imageId: number;
  reviewedById: number;
  status: ApprovalStatus;
  rejectionReason?: string;
}

@Injectable()
export class ReviewFaceImageUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.FACES)
    private readonly facesRepository: IFacesRepository,
    private readonly aiFaceService: AiFaceService,
  ) {}

  async execute(input: ReviewFaceImageInput) {
    const image = await this.facesRepository.reviewFaceImage(input);

    if (!image) {
      throw new NotFoundException('Face image not found');
    }

    if (image.status === ApprovalStatus.APPROVED) {
      const embedding = this.aiFaceService.extractEmbedding(image.fileId);
      await this.facesRepository.saveEmbedding({
        studentId: image.studentId,
        faceImageId: image.id,
        embedding,
      });
    }

    return image;
  }
}
