import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { IsEnum, IsNumber } from 'class-validator';
import { GetManualReviewQueueUseCase } from '../../application/use-cases/get-manual-review-queue.use-case';
import { ResolvePendingRecordUseCase } from '../../application/use-cases/resolve-pending-record.use-case';
import { AttendanceRecordStatus } from '../../../../common/domain/enums';

class ResolvePendingRecordDto {
  @IsNumber()
  recordId: number;

  @IsEnum({
    PRESENT: AttendanceRecordStatus.PRESENT,
    ABSENT: AttendanceRecordStatus.ABSENT,
  })
  status: AttendanceRecordStatus.PRESENT | AttendanceRecordStatus.ABSENT;
}

@Controller('exceptions')
export class ExceptionsController {
  constructor(
    private readonly getManualReviewQueueUseCase: GetManualReviewQueueUseCase,
    private readonly resolvePendingRecordUseCase: ResolvePendingRecordUseCase,
  ) {}

  @Get('sessions/:sessionId/review-queue')
  getReviewQueue(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.getManualReviewQueueUseCase.execute(sessionId);
  }

  @Patch('review-queue')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resolvePendingRecord(
    @Body() body: ResolvePendingRecordDto,
  ): Promise<void> {
    await this.resolvePendingRecordUseCase.execute(body);
  }
}
