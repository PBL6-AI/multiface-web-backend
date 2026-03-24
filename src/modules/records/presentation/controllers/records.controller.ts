import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GetSessionRecordsUseCase } from '../../application/use-cases/get-session-records.use-case';
import { GetStudentAttendanceSummaryUseCase } from '../../application/use-cases/get-student-attendance-summary.use-case';

@Controller('records')
export class RecordsController {
  constructor(
    private readonly getSessionRecordsUseCase: GetSessionRecordsUseCase,
    private readonly getStudentAttendanceSummaryUseCase: GetStudentAttendanceSummaryUseCase,
  ) {}

  @Get('sessions/:sessionId')
  getSessionRecords(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.getSessionRecordsUseCase.execute(sessionId);
  }

  @Get('students/:studentId/summary')
  getStudentSummary(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.getStudentAttendanceSummaryUseCase.execute(studentId);
  }
}
