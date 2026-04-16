import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
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
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators';
import { AuthGuard } from '../../../common/guards';
import { ApiSuccessResponseDoc } from '../../../common/swagger';
import type { ApiSuccessResponse } from '../../../common/types';
import type { AuthenticatedUser } from '../../auth/interfaces';
import { TestUploadFileDto, UploadedFileResponseDto } from '../dtos';
import { FilesService } from '../services';

type UploadedFilePayload = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('test-upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        category: {
          type: 'string',
          example: 'face_registration_raw',
        },
        checksum: {
          type: 'string',
          example: 'sha256:abc123',
        },
      },
      required: ['file'],
    },
  })
  @ApiOperation({
    summary: 'Upload a test file to S3 and create a file metadata record',
  })
  @ApiSuccessResponseDoc({
    status: HttpStatus.CREATED,
    description: 'Test file uploaded successfully',
    model: UploadedFileResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication token is missing or invalid',
  })
  async uploadTestFile(
    @CurrentUser() currentUser: AuthenticatedUser,
    @UploadedFile() file: UploadedFilePayload | undefined,
    @Body() testUploadFileDto: TestUploadFileDto,
  ): Promise<ApiSuccessResponse<UploadedFileResponseDto>> {
    if (!file) {
      throw new BadRequestException('Uploaded file is required');
    }

    const storedFile = await this.filesService.storeUploadedFile({
      uploaderId: currentUser.id,
      file,
      category: testUploadFileDto.category,
      checksum: testUploadFileDto.checksum ?? null,
    });

    return this.ok(this.filesService.serializeUploadedFile(storedFile));
  }

  private ok<TData>(data: TData): ApiSuccessResponse<TData> {
    return {
      success: true,
      data,
    };
  }
}
