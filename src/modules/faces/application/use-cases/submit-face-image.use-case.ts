import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import type { IFacesRepository } from '../../core/interfaces/faces.repository.interface';

interface SubmitFaceImageInput {
  studentId: number;
  fileId: number;
}

@Injectable()
export class SubmitFaceImageUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.FACES)
    private readonly facesRepository: IFacesRepository,
  ) {}

  async execute(input: SubmitFaceImageInput) {
    const requestId = await this.facesRepository.ensureRegistrationRequest(
      input.studentId,
    );

    return this.facesRepository.createFaceImage({
      studentId: input.studentId,
      requestId,
      fileId: input.fileId,
    });
  }
}
