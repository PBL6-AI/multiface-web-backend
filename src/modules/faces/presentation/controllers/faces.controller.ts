import { Body, Controller, Post, Put } from '@nestjs/common';
import { ReviewFaceImageUseCase } from '../../application/use-cases/review-face-image.use-case';
import { SubmitFaceImageUseCase } from '../../application/use-cases/submit-face-image.use-case';
import { ReviewFaceImageDto } from '../dtos/review-face-image.dto';
import { SubmitFaceImageDto } from '../dtos/submit-face-image.dto';

@Controller('faces')
export class FacesController {
  constructor(
    private readonly submitFaceImageUseCase: SubmitFaceImageUseCase,
    private readonly reviewFaceImageUseCase: ReviewFaceImageUseCase,
  ) {}

  @Post('registration')
  submitFaceImage(@Body() body: SubmitFaceImageDto) {
    return this.submitFaceImageUseCase.execute(body);
  }

  @Put('review')
  reviewFaceImage(@Body() body: ReviewFaceImageDto) {
    return this.reviewFaceImageUseCase.execute(body);
  }
}
