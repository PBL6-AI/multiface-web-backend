import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../../common/guards/auth.guard';
import {
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RegisterDto,
} from '../dtos/auth-request.dto';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { AuthService } from '../services/auth.service';
import type { ApiSuccessResponse } from '../../../common/types';
import {
  LoginResponseDto,
  LogoutResponseDto,
  RefreshTokenResponseDto,
  RegisterResponseDto,
} from '../dtos/auth-response.dto';
import type { UserResponseDto } from '../../users/dtos/users-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ApiSuccessResponse<RegisterResponseDto>> {
    return this.ok(await this.authService.register(registerDto));
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ApiSuccessResponse<LoginResponseDto>> {
    return this.ok(await this.authService.login(loginDto));
  }

  @Post('refresh')
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<ApiSuccessResponse<RefreshTokenResponseDto>> {
    return this.ok(await this.authService.refreshTokens(refreshTokenDto));
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() logoutDto: LogoutDto,
  ): Promise<ApiSuccessResponse<LogoutResponseDto>> {
    return this.ok(await this.authService.logout(currentUser.id, logoutDto));
  }

  @Get('me')
  @UseGuards(AuthGuard)
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
