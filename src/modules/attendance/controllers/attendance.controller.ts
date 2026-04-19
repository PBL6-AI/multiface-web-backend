import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiHeader,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { CurrentUser, Roles } from '../../../common/decorators';
import { AuthGuard, RolesGuard } from '../../../common/guards';
import { ApiSuccessResponseDoc } from '../../../common/swagger';
import type { ApiSuccessResponse } from '../../../common/types';
import type { AuthenticatedUser } from '../../auth/interfaces';
import {
  AttendanceActionMessageResponseDto,
  AttendanceSessionResponseDto,
  CreateAttendanceSessionDto,
  IngestRecognitionEventDto,
  ListAttendanceSessionsQueryDto,
  RecognitionEventIngestionResponseDto,
} from '../dtos';
import { AttendanceService } from '../services';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly configService: ConfigService,
  ) {}

  @Post('sessions')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Authentication token is missing or invalid',
  })
  @ApiOperation({
    summary: 'Create an attendance session',
  })
  @ApiSuccessResponseDoc({
    status: HttpStatus.CREATED,
    description: 'Attendance session created successfully',
    model: AttendanceSessionResponseDto,
  })
  @ApiForbiddenResponse({
    description:
      'Only administrators or teachers that own the class can create attendance sessions',
  })
  async createSession(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() createAttendanceSessionDto: CreateAttendanceSessionDto,
  ): Promise<ApiSuccessResponse<AttendanceSessionResponseDto>> {
    return this.ok(
      await this.attendanceService.createSession(
        currentUser,
        createAttendanceSessionDto,
      ),
    );
  }

  @Get('sessions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List attendance sessions visible to the current user',
  })
  @ApiSuccessResponseDoc({
    description: 'Attendance sessions returned successfully',
    model: AttendanceSessionResponseDto,
    isArray: true,
  })
  async listSessions(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: ListAttendanceSessionsQueryDto,
  ): Promise<ApiSuccessResponse<AttendanceSessionResponseDto[]>> {
    return this.ok(
      await this.attendanceService.listSessions(currentUser, query.status),
    );
  }

  @Get('sessions/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get attendance session details',
  })
  @ApiSuccessResponseDoc({
    description: 'Attendance session returned successfully',
    model: AttendanceSessionResponseDto,
  })
  async getSessionById(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseIntPipe) sessionId: number,
  ): Promise<ApiSuccessResponse<AttendanceSessionResponseDto>> {
    return this.ok(
      await this.attendanceService.getSessionById(currentUser, sessionId),
    );
  }

  @Patch('sessions/:id/close')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Close an active attendance session',
  })
  @ApiSuccessResponseDoc({
    description: 'Attendance session closed successfully',
    model: AttendanceActionMessageResponseDto,
  })
  async closeSession(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseIntPipe) sessionId: number,
  ): Promise<ApiSuccessResponse<AttendanceActionMessageResponseDto>> {
    return this.ok(
      await this.attendanceService.closeSession(currentUser, sessionId),
    );
  }

  @Post('sessions/:id/recognition-events')
  @ApiHeader({
    name: 'x-edge-token',
    required: false,
    description:
      'Shared token used by the Raspberry Pi edge client to ingest recognition events',
  })
  @ApiOperation({
    summary: 'Ingest a recognition event from the edge device or AI service',
  })
  @ApiSuccessResponseDoc({
    status: HttpStatus.CREATED,
    description: 'Recognition event ingested successfully',
    model: RecognitionEventIngestionResponseDto,
  })
  async ingestRecognitionEvent(
    @Param('id', ParseIntPipe) sessionId: number,
    @Headers('x-edge-token') edgeToken: string | undefined,
    @Body() ingestRecognitionEventDto: IngestRecognitionEventDto,
  ): Promise<ApiSuccessResponse<RecognitionEventIngestionResponseDto>> {
    const expectedToken =
      this.configService.get<string>('edge.ingestToken') ?? '';

    if (expectedToken && edgeToken !== expectedToken) {
      throw new UnauthorizedException('Invalid edge token');
    }

    return this.ok(
      await this.attendanceService.ingestRecognitionEvent(
        sessionId,
        ingestRecognitionEventDto,
      ),
    );
  }

  private ok<TData>(data: TData): ApiSuccessResponse<TData> {
    return {
      success: true,
      data,
    };
  }
}
