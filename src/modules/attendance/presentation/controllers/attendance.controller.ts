import { Body, Controller, Post } from '@nestjs/common';
import { ProcessRecognitionUseCase } from '../../application/use-cases/process-recognition.use-case';
import { StartAttendanceSessionUseCase } from '../../application/use-cases/start-attendance-session.use-case';
import { ProcessRecognitionDto } from '../dtos/process-recognition.dto';
import { StartAttendanceSessionDto } from '../dtos/start-attendance-session.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly startAttendanceSessionUseCase: StartAttendanceSessionUseCase,
    private readonly processRecognitionUseCase: ProcessRecognitionUseCase,
  ) {}

  @Post('sessions')
  startSession(@Body() body: StartAttendanceSessionDto) {
    return this.startAttendanceSessionUseCase.execute(body);
  }

  @Post('recognitions')
  processRecognition(@Body() body: ProcessRecognitionDto) {
    return this.processRecognitionUseCase.execute(body);
  }
}
