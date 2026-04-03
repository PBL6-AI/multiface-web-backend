import type { UserResponseDto } from '../../users/dtos/users-response.dto';

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

export interface LogoutResponseDto {
  message: string;
}

export type RefreshTokenResponseDto = LoginResponseDto;

export type RegisterResponseDto = UserResponseDto;
