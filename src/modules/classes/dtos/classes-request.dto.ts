import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ClassScheduleInputDto {
  @ApiProperty({
    description:
      'Day of week for the class schedule, where 1 is Monday and 7 is Sunday',
    example: 2,
    minimum: 1,
    maximum: 7,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek: number;

  @ApiProperty({
    description: 'Schedule start time in HH:mm or HH:mm:ss format',
    example: '07:30',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  startTime: string;

  @ApiProperty({
    description: 'Schedule end time in HH:mm or HH:mm:ss format',
    example: '09:30',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  endTime: string;

  @ApiProperty({
    description: 'Classroom or room label',
    example: 'A1-204',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  room: string;
}

export class CreateClassDto {
  @ApiProperty({
    description: 'Display name of the class',
    example: 'SE304 - Distributed Systems',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  className: string;

  @ApiPropertyOptional({
    description:
      'Unique class code. If omitted, the system generates one automatically',
    example: 'SE304-2026',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9-]+$/)
  classCode?: string;

  @ApiPropertyOptional({
    description: 'Optional description of the class',
    example: 'Main class for the SE304 subject',
    maxLength: 1000,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional({
    description:
      'Teacher identifier. Required when an admin creates a class for a teacher',
    example: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  teacherId?: number;

  @ApiPropertyOptional({
    description: 'Weekly class schedules',
    type: () => ClassScheduleInputDto,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(14)
  @ValidateNested({ each: true })
  @Type(() => ClassScheduleInputDto)
  schedules?: ClassScheduleInputDto[];
}

export class UpdateClassDto {
  @ApiPropertyOptional({
    description: 'Updated class name',
    example: 'SE304 - Distributed Systems Advanced',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  className?: string;

  @ApiPropertyOptional({
    description: 'Updated class code',
    example: 'SE304-ADV',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9-]+$/)
  classCode?: string;

  @ApiPropertyOptional({
    description: 'Updated class description',
    example: 'Updated description for the class',
    maxLength: 1000,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Updated teacher identifier',
    example: 15,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  teacherId?: number;

  @ApiPropertyOptional({
    description: 'Full replacement of the class weekly schedules',
    type: () => ClassScheduleInputDto,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(14)
  @ValidateNested({ each: true })
  @Type(() => ClassScheduleInputDto)
  schedules?: ClassScheduleInputDto[];
}

export class JoinClassByCodeDto {
  @ApiProperty({
    description: 'Class code used by a student to join a class',
    example: 'SE304-2026',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9-]+$/)
  classCode: string;
}
