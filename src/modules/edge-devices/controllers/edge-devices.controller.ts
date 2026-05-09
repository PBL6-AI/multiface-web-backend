import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { CurrentUser, Roles } from '../../../common/decorators';
import { AuthGuard, RolesGuard } from '../../../common/guards';
import { ApiSuccessResponseDoc } from '../../../common/swagger';
import type { ApiSuccessResponse } from '../../../common/types';
import type { AuthenticatedUser } from '../../auth/interfaces';
import {
  EdgeDeviceHeartbeatDto,
  EdgeDeviceResponseDto,
  RegisterEdgeDeviceDto,
} from '../dtos';
import { EdgeDevicesService } from '../services';

@ApiTags('Edge Devices')
@Controller('edge/devices')
export class EdgeDevicesController {
  constructor(
    private readonly edgeDevicesService: EdgeDevicesService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiHeader({
    name: 'x-edge-token',
    required: false,
    description: 'Shared token used by edge devices to register themselves',
  })
  @ApiOperation({ summary: 'Register or update an edge device' })
  @ApiSuccessResponseDoc({
    status: HttpStatus.CREATED,
    description: 'Edge device registered successfully',
    model: EdgeDeviceResponseDto,
  })
  async register(
    @Headers('x-edge-token') edgeToken: string | undefined,
    @Body() payload: RegisterEdgeDeviceDto,
  ): Promise<ApiSuccessResponse<EdgeDeviceResponseDto>> {
    this.ensureEdgeToken(edgeToken);
    return this.ok(await this.edgeDevicesService.register(payload));
  }

  @Post('heartbeat')
  @ApiHeader({
    name: 'x-edge-token',
    required: false,
    description: 'Shared token used by edge devices to send heartbeat',
  })
  @ApiOperation({ summary: 'Receive an edge device heartbeat' })
  @ApiSuccessResponseDoc({
    status: HttpStatus.OK,
    description: 'Heartbeat accepted successfully',
    model: EdgeDeviceResponseDto,
  })
  async heartbeat(
    @Headers('x-edge-token') edgeToken: string | undefined,
    @Body() payload: EdgeDeviceHeartbeatDto,
  ): Promise<ApiSuccessResponse<EdgeDeviceResponseDto>> {
    this.ensureEdgeToken(edgeToken);
    return this.ok(await this.edgeDevicesService.heartbeat(payload));
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List registered edge devices' })
  @ApiSuccessResponseDoc({
    status: HttpStatus.OK,
    description: 'Edge devices returned successfully',
    model: EdgeDeviceResponseDto,
    isArray: true,
  })
  async list(
    @CurrentUser() _currentUser: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<EdgeDeviceResponseDto[]>> {
    return this.ok(await this.edgeDevicesService.list());
  }

  @Get(':deviceCode')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a registered edge device by code' })
  @ApiSuccessResponseDoc({
    status: HttpStatus.OK,
    description: 'Edge device returned successfully',
    model: EdgeDeviceResponseDto,
  })
  async getByCode(
    @CurrentUser() _currentUser: AuthenticatedUser,
    @Param('deviceCode') deviceCode: string,
  ): Promise<ApiSuccessResponse<EdgeDeviceResponseDto>> {
    return this.ok(await this.edgeDevicesService.getByCode(deviceCode));
  }

  private ensureEdgeToken(edgeToken: string | undefined) {
    const expectedToken =
      this.configService.get<string>('edge.ingestToken') ?? '';

    if (expectedToken && edgeToken !== expectedToken) {
      throw new UnauthorizedException('Invalid edge token');
    }
  }

  private ok<TData>(data: TData): ApiSuccessResponse<TData> {
    return {
      success: true,
      data,
    };
  }
}
