import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GetSessionLiveDataUseCase } from '../../application/use-cases/get-session-live-data.use-case';

@Controller('real-time')
export class RealTimeController {
  constructor(
    private readonly getSessionLiveDataUseCase: GetSessionLiveDataUseCase,
  ) {}

  @Get('sessions/:sessionId')
  getSessionLiveData(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.getSessionLiveDataUseCase.execute(sessionId);
  }
}
