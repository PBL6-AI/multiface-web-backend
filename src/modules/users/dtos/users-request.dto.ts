import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { SYSTEM_ROLES } from '../../auth/auth.constants';

export class CreateUserDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'Tran Thi B',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({
    description: 'Unique code of the user',
    example: 'GV001',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  userCode: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'teacher@example.com',
    maxLength: 255,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'Initial password for the user',
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
    description: 'System role assigned to the user',
    enum: SYSTEM_ROLES,
    example: 'teacher',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(SYSTEM_ROLES)
  role: (typeof SYSTEM_ROLES)[number];

  @ApiPropertyOptional({
    description: 'Phone number of the user',
    example: '0912345678',
    maxLength: 50,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string | null;

  @ApiPropertyOptional({
    description: 'Department identifier',
    example: 1,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  departmentId?: number | null;

  @ApiPropertyOptional({
    description: 'Specialization identifier',
    example: 3,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  specializationId?: number | null;

  @ApiPropertyOptional({
    description: 'Avatar file identifier stored in the files table',
    example: 15,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  avatarFileId?: number | null;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Updated full name of the user',
    example: 'Tran Thi B Updated',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Updated email address of the user',
    example: 'teacher.updated@example.com',
    maxLength: 255,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    description: 'Updated phone number of the user',
    example: '0988777666',
    maxLength: 50,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string | null;

  @ApiPropertyOptional({
    description: 'Updated department identifier',
    example: 1,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  departmentId?: number | null;

  @ApiPropertyOptional({
    description: 'Updated specialization identifier',
    example: 3,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  specializationId?: number | null;

  @ApiPropertyOptional({
    description: 'Updated avatar file identifier',
    example: 15,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  avatarFileId?: number | null;
}

export class UpdateUserDto extends UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Updated unique user code',
    example: 'GV002',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  userCode?: string;

  @ApiPropertyOptional({
    description: 'Updated system role',
    enum: SYSTEM_ROLES,
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  @IsIn(SYSTEM_ROLES)
  role?: (typeof SYSTEM_ROLES)[number];
}

export class ListUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Filter users by role',
    enum: SYSTEM_ROLES,
    example: 'student',
  })
  @IsOptional()
  @IsString()
  @IsIn(SYSTEM_ROLES)
  role?: (typeof SYSTEM_ROLES)[number];
}
