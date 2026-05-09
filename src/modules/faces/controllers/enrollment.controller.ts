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
  CompleteEnrollmentSessionDto,
  CreateEnrollmentSessionDto,
  EnrollmentSessionResponseDto,
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
