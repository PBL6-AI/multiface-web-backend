import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators';
import { AuthGuard } from '../../../common/guards';
import { ApiSuccessResponseDoc } from '../../../common/swagger';
import type { ApiSuccessResponse } from '../../../common/types';
import {
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RegisterDto,
  LoginResponseDto,
  LogoutResponseDto,
  RefreshTokenResponseDto,
  RegisterResponseDto,
} from '../dtos';
import type { AuthenticatedUser } from '../interfaces';
import { AuthService } from '../services';
import { UserResponseDto } from '../../users/dtos';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new student account',
    description: 'Creates a new account and assigns the default student role.',
  })
  @ApiSuccessResponseDoc({
    status: HttpStatus.CREATED,
    description: 'Student account registered successfully',
    model: RegisterResponseDto,
  })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ApiSuccessResponse<RegisterResponseDto>> {
    return this.ok(await this.authService.register(registerDto));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate a user',
    description: 'Authenticates a user by user code and password.',
  })
  @ApiSuccessResponseDoc({
    description: 'User authenticated successfully',
    model: LoginResponseDto,
  })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ApiSuccessResponse<LoginResponseDto>> {
    return this.ok(await this.authService.login(loginDto));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh authentication tokens',
    description: 'Issues a new access token and refresh token pair.',
  })
  @ApiSuccessResponseDoc({
    description: 'Tokens refreshed successfully',
    model: RefreshTokenResponseDto,
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<ApiSuccessResponse<RefreshTokenResponseDto>> {
    return this.ok(await this.authService.refreshTokens(refreshTokenDto));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout the current user',
    description:
      'Logs out the current user and optionally revokes a refresh token.',
  })
  @ApiSuccessResponseDoc({
    description: 'Logout completed successfully',
    model: LogoutResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication token is missing or invalid',
  })
  async logout(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() logoutDto: LogoutDto,
  ): Promise<ApiSuccessResponse<LogoutResponseDto>> {
    return this.ok(await this.authService.logout(currentUser.id, logoutDto));
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated user',
    description: 'Returns the profile of the currently authenticated user.',
  })
  @ApiSuccessResponseDoc({
    description: 'Current user profile returned successfully',
    model: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication token is missing or invalid',
  })
  async getMe(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<UserResponseDto>> {
    return this.ok(await this.authService.getCurrentUser(currentUser.id));
  }

  private ok<TData>(data: TData): ApiSuccessResponse<TData> {
    return {
      success: true,
      data,
    };
  }
}
