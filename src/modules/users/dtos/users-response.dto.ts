import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UploadedFileResponseDto } from '../../files/dtos';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'Tran Thi B',
  })
  fullName: string;

  @ApiProperty({
    description: 'Unique user code',
    example: 'GV001',
  })
  userCode: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'teacher@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Phone number of the user',
    example: '0912345678',
    nullable: true,
  })
  phone: string | null;

  @ApiPropertyOptional({
    description: 'Avatar file identifier',
    example: 15,
    nullable: true,
  })
  avatarFileId: number | null;

  @ApiPropertyOptional({
    description: 'Avatar file metadata',
    type: () => UploadedFileResponseDto,
    nullable: true,
  })
  avatarFile?: UploadedFileResponseDto | null;

  @ApiPropertyOptional({
    description: 'Computed avatar URL',
    example:
      'https://pb5-multiface-assets.s3.ap-southeast-1.amazonaws.com/avatar/2026-04-26/example.jpg',
    nullable: true,
  })
  avatarUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Department identifier',
    example: 1,
    nullable: true,
  })
  departmentId: number | null;

  @ApiPropertyOptional({
    description: 'Department name',
    example: 'Faculty of Information Technology',
    nullable: true,
  })
  departmentName: string | null;

  @ApiPropertyOptional({
    description: 'Specialization identifier',
    example: 3,
    nullable: true,
  })
  specializationId: number | null;

  @ApiPropertyOptional({
    description: 'Specialization name',
    example: 'Software Engineering',
    nullable: true,
  })
  specializationName: string | null;

  @ApiProperty({
    description: 'Role identifier',
    example: 2,
  })
  roleId: number;

  @ApiPropertyOptional({
    description: 'Role name in lowercase',
    example: 'teacher',
    nullable: true,
  })
  role: string | null;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2026-04-12T08:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2026-04-12T08:30:00.000Z',
  })
  updatedAt: Date;
}
