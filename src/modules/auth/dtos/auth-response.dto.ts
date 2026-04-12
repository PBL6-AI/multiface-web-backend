import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dtos/users-response.dto';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token used for authenticated API calls',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token used to issue new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Authenticated user profile',
    type: () => UserResponseDto,
  })
  user: UserResponseDto;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Human-readable logout result',
    example: 'Logged out successfully',
  })
  message: string;
}

export class RefreshTokenResponseDto extends LoginResponseDto {}

export class RegisterResponseDto extends UserResponseDto {}
