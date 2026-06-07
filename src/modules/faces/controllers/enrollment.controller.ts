import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { ApiSuccessResponse } from '../../../common/types';
import { CurrentUser, Roles } from '../../../common/decorators';
import { AuthGuard, RolesGuard } from '../../../common/guards';
import { ApiSuccessResponseDoc } from '../../../common/swagger';
import type { AuthenticatedUser } from '../../auth/interfaces';
import {
  CompleteEdgeEnrollmentRecordingDto,
  CompleteEnrollmentSessionDto,
  EdgeEnrollmentDeviceDto,
  EdgeEnrollmentPreviewResponseDto,
  EdgeEnrollmentRecordingResponseDto,
  CreateEnrollmentSessionDto,
  EnrollmentSessionResponseDto,
  StartEdgeEnrollmentPreviewDto,
  StartEdgeEnrollmentRecordingDto,
} from '../dtos';
import { EnrollmentService } from '../services';

@ApiTags('Enrollment')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Authentication token is missing or invalid',
})
@Controller('api/enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post('session')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student')
  @ApiOperation({ summary: 'Create a new face enrollment session' })
  @ApiSuccessResponseDoc({
    status: HttpStatus.CREATED,
    description: 'Enrollment session created successfully',
    model: EnrollmentSessionResponseDto,
  })
  async createSession(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() body: CreateEnrollmentSessionDto,
  ): Promise<ApiSuccessResponse<EnrollmentSessionResponseDto>> {
    return this.ok(
      await this.enrollmentService.createSession(currentUser, body),
    );
  }

  @Post('complete')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student')
  @ApiOperation({
    summary: 'Complete upload and enqueue enrollment processing',
  })
  @ApiSuccessResponseDoc({
    description: 'Enrollment session queued successfully',
    model: EnrollmentSessionResponseDto,
  })
  async completeSession(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() body: CompleteEnrollmentSessionDto,
  ): Promise<ApiSuccessResponse<EnrollmentSessionResponseDto>> {
    return this.ok(
      await this.enrollmentService.completeSession(currentUser, body),
    );
  }

  @Get('edge/devices')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student')
  @ApiOperation({
    summary: 'List Arducam edge devices available for enrollment',
  })
  @ApiSuccessResponseDoc({
    description: 'Edge enrollment devices returned successfully',
    model: EdgeEnrollmentDeviceDto,
    isArray: true,
  })
  async listEdgeDevices(
    @CurrentUser() _currentUser: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<EdgeEnrollmentDeviceDto[]>> {
    return this.ok(await this.enrollmentService.listEdgeEnrollmentDevices());
  }

  @Post('edge/preview')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student')
  @ApiOperation({ summary: 'Start Arducam preview for face enrollment' })
  @ApiSuccessResponseDoc({
    description: 'Arducam preview started successfully',
    model: EdgeEnrollmentPreviewResponseDto,
  })
  async startEdgePreview(
    @CurrentUser() _currentUser: AuthenticatedUser,
    @Body() body: StartEdgeEnrollmentPreviewDto,
  ): Promise<ApiSuccessResponse<EdgeEnrollmentPreviewResponseDto>> {
    return this.ok(await this.enrollmentService.startEdgePreview(body));
  }

  @Post('edge/preview/stop')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student')
  @ApiOperation({ summary: 'Stop Arducam preview for face enrollment' })
  async stopEdgePreview(
    @CurrentUser() _currentUser: AuthenticatedUser,
    @Body() body: StartEdgeEnrollmentPreviewDto,
  ): Promise<ApiSuccessResponse<Record<string, unknown>>> {
    return this.ok(await this.enrollmentService.stopEdgePreview(body));
  }

  @Post('edge/recording/start')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student')
  @ApiOperation({ summary: 'Start Arducam recording for face enrollment' })
  @ApiSuccessResponseDoc({
    description: 'Arducam enrollment recording started successfully',
    model: EdgeEnrollmentRecordingResponseDto,
  })
  async startEdgeRecording(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() body: StartEdgeEnrollmentRecordingDto,
  ): Promise<ApiSuccessResponse<EdgeEnrollmentRecordingResponseDto>> {
    return this.ok(
      await this.enrollmentService.startEdgeRecording(currentUser, body),
    );
  }

  @Post('edge/recording/complete')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student')
  @ApiOperation({
    summary: 'Stop Arducam recording and enqueue enrollment processing',
  })
  @ApiSuccessResponseDoc({
    description: 'Arducam enrollment recording completed successfully',
    model: EnrollmentSessionResponseDto,
  })
  async completeEdgeRecording(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() body: CompleteEdgeEnrollmentRecordingDto,
  ): Promise<ApiSuccessResponse<EnrollmentSessionResponseDto>> {
    return this.ok(
      await this.enrollmentService.completeEdgeRecording(currentUser, body),
    );
  }

  @Get('sessions/me/latest')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student')
  @ApiOperation({
    summary: 'Get the latest enrollment session for the current student',
  })
  @ApiSuccessResponseDoc({
    description: 'Latest enrollment session returned successfully',
    model: EnrollmentSessionResponseDto,
  })
  async getMyLatestSession(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<EnrollmentSessionResponseDto>> {
    return this.ok(
      await this.enrollmentService.getLatestSessionForStudent(currentUser),
    );
  }

  @Get('sessions/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get an enrollment session by id' })
  @ApiSuccessResponseDoc({
    description: 'Enrollment session returned successfully',
    model: EnrollmentSessionResponseDto,
  })
  async getSessionById(
    @Param('id', ParseIntPipe) sessionId: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<EnrollmentSessionResponseDto>> {
    return this.ok(
      await this.enrollmentService.getSessionByIdForUser(
        sessionId,
        currentUser,
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
