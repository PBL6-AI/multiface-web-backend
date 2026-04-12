import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Unique user code used to sign in',
    example: 'GV001',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  userCode: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePass123!',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'Nguyen Van A',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({
    description: 'Unique user code, usually student or teacher code',
    example: 'SV001',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  userCode: string;

  @ApiProperty({
    description: 'Email address used for account communication',
    example: 'student@example.com',
    maxLength: 255,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'Password for the account',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @ApiProperty({
    description: 'Password confirmation, must match password',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  confirmPassword: string;

  @ApiPropertyOptional({
    description: 'Phone number of the user',
    example: '0901234567',
    maxLength: 50,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string | null;

  @ApiPropertyOptional({
    description: 'Department identifier assigned to the user',
    example: 1,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  departmentId?: number | null;

  @ApiPropertyOptional({
    description: 'Specialization identifier assigned to the user',
    example: 3,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  specializationId?: number | null;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token issued during login',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class LogoutDto {
  @ApiPropertyOptional({
    description: 'Optional refresh token to revoke on logout',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  refreshToken?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current account password',
    example: 'OldPass123!',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    description: 'New password to replace the current password',
    example: 'NewPass123!',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  newPassword: string;

  @ApiProperty({
    description: 'Confirmation of the new password',
    example: 'NewPass123!',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  confirmNewPassword: string;
}
