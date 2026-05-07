import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
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
  BuildFaceRegistrationEmbeddingsDto,
  CreateFaceRegistrationSessionDto,
  FaceRegistrationEmbeddingsBuildResponseDto,
  FaceRegistrationSessionResponseDto,
  UploadFaceRegistrationSampleDto,
} from '../dtos';
import { FacesService } from '../services';

type UploadedFilePayload = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@ApiTags('Face Registration')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Authentication token is missing or invalid',
})
@Controller('face-registration/sessions')
export class FacesController {
  constructor(private readonly facesService: FacesService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student')
  @ApiOperation({
    summary: 'Create a new face registration session for the current student',
  })
  @ApiSuccessResponseDoc({
    status: HttpStatus.CREATED,
    description: 'Face registration session created successfully',
    model: FaceRegistrationSessionResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Only students can create face registration sessions',
  })
  async createSession(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() body: CreateFaceRegistrationSessionDto,
  ): Promise<ApiSuccessResponse<FaceRegistrationSessionResponseDto>> {
    return this.ok(await this.facesService.createSession(currentUser, body));
  }

  @Get('me/latest')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student')
  @ApiOperation({
    summary: 'Get the latest face registration session for the current student',
  })
  @ApiSuccessResponseDoc({
    description: 'Latest face registration session returned successfully',
    model: FaceRegistrationSessionResponseDto,
  })
  async getMyLatestSession(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<FaceRegistrationSessionResponseDto>> {
    return this.ok(
      await this.facesService.getLatestSessionForStudent(currentUser),
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get a face registration session by id',
  })
  @ApiSuccessResponseDoc({
    description: 'Face registration session returned successfully',
    model: FaceRegistrationSessionResponseDto,
  })
  async getSessionById(
    @Param('id', ParseIntPipe) sessionId: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<FaceRegistrationSessionResponseDto>> {
    return this.ok(
      await this.facesService.getSessionByIdForUser(sessionId, currentUser),
    );
  }

  @Post(':id/samples')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        pose: {
          type: 'string',
          enum: ['front', 'left', 'right', 'up', 'down'],
        },
        captureSource: { type: 'string' },
        capturedAt: { type: 'string', format: 'date-time' },
        qualityScore: { type: 'number' },
        detectionScore: { type: 'number' },
        faceCount: { type: 'number' },
        estimatedPose: {
          type: 'string',
          enum: ['front', 'left', 'right', 'up', 'down'],
        },
        bbox: {
          type: 'string',
          example: '{"x1":10,"y1":20,"x2":100,"y2":120}',
        },
        landmarks: {
          type: 'string',
          example:
            '[{"x":10,"y":20},{"x":30,"y":22},{"x":20,"y":30},{"x":12,"y":40},{"x":28,"y":41}]',
        },
        aiValidated: { type: 'boolean' },
        alignedImageBase64: { type: 'string' },
        aiMetadata: { type: 'string', example: '{"reason":"valid"}' },
      },
      required: ['file', 'pose'],
    },
  })
  @ApiOperation({
    summary:
      'Upload one accepted registration sample for a face registration session',
  })
  @ApiSuccessResponseDoc({
    status: HttpStatus.CREATED,
    description: 'Face registration sample uploaded successfully',
    model: FaceRegistrationSessionResponseDto,
  })
  async uploadSessionSample(
    @Param('id', ParseIntPipe) sessionId: number,
    @CurrentUser() currentUser: AuthenticatedUser,
    @UploadedFile() file: UploadedFilePayload | undefined,
    @Body() body: UploadFaceRegistrationSampleDto,
  ): Promise<ApiSuccessResponse<FaceRegistrationSessionResponseDto>> {
    if (!file) {
      throw new BadRequestException('Uploaded face sample is required');
    }

    return this.ok(
      await this.facesService.uploadSessionSample(
        sessionId,
        currentUser,
        file,
        body,
      ),
    );
  }

  @Post(':id/complete')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student')
  @ApiOperation({
    summary:
      'Mark a face registration session as completed after collecting enough samples',
  })
  @ApiSuccessResponseDoc({
    description: 'Face registration session completed successfully',
    model: FaceRegistrationSessionResponseDto,
  })
  async completeSession(
    @Param('id', ParseIntPipe) sessionId: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<FaceRegistrationSessionResponseDto>> {
    return this.ok(
      await this.facesService.completeSession(sessionId, currentUser),
    );
  }

  @Post(':id/build-embeddings')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student', 'admin')
  @ApiOperation({
    summary: 'Build embeddings for a completed face registration session',
  })
  @ApiSuccessResponseDoc({
    description: 'Embeddings built successfully',
    model: FaceRegistrationEmbeddingsBuildResponseDto,
  })
  async buildEmbeddings(
    @Param('id', ParseIntPipe) sessionId: number,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() body: BuildFaceRegistrationEmbeddingsDto,
  ): Promise<ApiSuccessResponse<FaceRegistrationEmbeddingsBuildResponseDto>> {
    return this.ok(
      await this.facesService.buildEmbeddingsForSession(
        sessionId,
        currentUser,
        body,
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
