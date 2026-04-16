import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
  FaceRegistrationRequestResponseDto,
  ListFaceRegistrationRequestsQueryDto,
  ReviewFaceRegistrationRequestDto,
  UploadFaceRegistrationImageDto,
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
@Controller('face-registration/requests')
export class FacesController {
  constructor(private readonly facesService: FacesService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student')
  @ApiOperation({
    summary: 'Create a new face registration request for the current student',
  })
  @ApiSuccessResponseDoc({
    status: HttpStatus.CREATED,
    description: 'Face registration request created successfully',
    model: FaceRegistrationRequestResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Only students can create face registration requests',
  })
  async createMyRequest(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<FaceRegistrationRequestResponseDto>> {
    return this.ok(await this.facesService.createRequest(currentUser));
  }

  @Get('me/latest')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student')
  @ApiOperation({
    summary: 'Get the latest face registration request for the current student',
  })
  @ApiSuccessResponseDoc({
    description: 'Latest face registration request returned successfully',
    model: FaceRegistrationRequestResponseDto,
  })
  @ApiForbiddenResponse({
    description:
      'Only students can access their latest face registration request',
  })
  async getMyLatestRequest(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<FaceRegistrationRequestResponseDto>> {
    return this.ok(
      await this.facesService.getLatestRequestForStudent(currentUser),
    );
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'List face registration requests for administrators',
  })
  @ApiSuccessResponseDoc({
    description: 'Face registration requests returned successfully',
    model: FaceRegistrationRequestResponseDto,
    isArray: true,
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can list face registration requests',
  })
  async listRequests(
    @Query() query: ListFaceRegistrationRequestsQueryDto,
  ): Promise<ApiSuccessResponse<FaceRegistrationRequestResponseDto[]>> {
    return this.ok(await this.facesService.listRequests(query));
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get a face registration request by id',
  })
  @ApiSuccessResponseDoc({
    description: 'Face registration request returned successfully',
    model: FaceRegistrationRequestResponseDto,
  })
  async getRequestById(
    @Param('id', ParseIntPipe) requestId: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<FaceRegistrationRequestResponseDto>> {
    return this.ok(
      await this.facesService.getRequestByIdForUser(requestId, currentUser),
    );
  }

  @Post(':id/images')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        pose: {
          type: 'string',
          enum: ['front', 'left', 'right', 'up', 'down'],
          example: 'front',
        },
        checksum: {
          type: 'string',
          example: 'sha256:front-image-hash',
        },
        captureSource: {
          type: 'string',
          example: 'web_registration',
        },
        capturedAt: {
          type: 'string',
          format: 'date-time',
          example: '2026-04-16T14:10:00.000Z',
        },
        qualityScore: {
          type: 'number',
          example: 0.91,
        },
      },
      required: ['file', 'pose'],
    },
  })
  @ApiOperation({
    summary: 'Upload one pose image for a face registration request',
  })
  @ApiSuccessResponseDoc({
    status: HttpStatus.CREATED,
    description: 'Face image uploaded successfully',
    model: FaceRegistrationRequestResponseDto,
  })
  @ApiForbiddenResponse({
    description:
      'Only students can upload images to their face registration requests',
  })
  async uploadRequestImage(
    @Param('id', ParseIntPipe) requestId: number,
    @CurrentUser() currentUser: AuthenticatedUser,
    @UploadedFile() file: UploadedFilePayload | undefined,
    @Body() uploadFaceRegistrationImageDto: UploadFaceRegistrationImageDto,
  ): Promise<ApiSuccessResponse<FaceRegistrationRequestResponseDto>> {
    if (!file) {
      throw new BadRequestException('Uploaded face image is required');
    }

    return this.ok(
      await this.facesService.uploadRequestImage(
        requestId,
        currentUser,
        file,
        uploadFaceRegistrationImageDto,
      ),
    );
  }

  @Patch(':id/review')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Approve or reject a face registration request',
  })
  @ApiSuccessResponseDoc({
    description: 'Face registration request reviewed successfully',
    model: FaceRegistrationRequestResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can review face registration requests',
  })
  async reviewRequest(
    @Param('id', ParseIntPipe) requestId: number,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body()
    reviewFaceRegistrationRequestDto: ReviewFaceRegistrationRequestDto,
  ): Promise<ApiSuccessResponse<FaceRegistrationRequestResponseDto>> {
    return this.ok(
      await this.facesService.reviewRequest(
        requestId,
        currentUser,
        reviewFaceRegistrationRequestDto,
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
