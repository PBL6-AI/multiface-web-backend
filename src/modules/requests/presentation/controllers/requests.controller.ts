import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateAppealUseCase } from '../../application/use-cases/create-appeal.use-case';
import { CreateLeaveRequestUseCase } from '../../application/use-cases/create-leave-request.use-case';
import { ReviewRequestUseCase } from '../../application/use-cases/review-request.use-case';
import { CreateAppealDto } from '../dtos/create-appeal.dto';
import { CreateLeaveRequestDto } from '../dtos/create-leave-request.dto';
import { ReviewRequestDto } from '../dtos/review-request.dto';

@Controller('requests')
export class RequestsController {
  constructor(
    private readonly createLeaveRequestUseCase: CreateLeaveRequestUseCase,
    private readonly createAppealUseCase: CreateAppealUseCase,
    private readonly reviewRequestUseCase: ReviewRequestUseCase,
  ) {}

  @Post('leaves')
  createLeaveRequest(@Body() body: CreateLeaveRequestDto) {
    return this.createLeaveRequestUseCase.execute(body);
  }

  @Post('appeals')
  createAppeal(@Body() body: CreateAppealDto) {
    return this.createAppealUseCase.execute(body);
  }

  @Patch('leaves/:requestId/review')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reviewLeaveRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() body: ReviewRequestDto,
  ): Promise<void> {
    await this.reviewRequestUseCase.execute({
      type: 'leave',
      requestId,
      ...body,
    });
  }

  @Patch('appeals/:appealId/review')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reviewAppeal(
    @Param('appealId', ParseIntPipe) appealId: number,
    @Body() body: ReviewRequestDto,
  ): Promise<void> {
    await this.reviewRequestUseCase.execute({
      type: 'appeal',
      appealId,
      ...body,
    });
  }
}
