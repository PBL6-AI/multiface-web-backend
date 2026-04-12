import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClassTeacherSummaryDto {
  @ApiProperty({
    description: 'Teacher identifier',
    example: 12,
  })
  id: number;

  @ApiProperty({
    description: 'Teacher full name',
    example: 'Le Van Giang',
  })
  fullName: string;

  @ApiProperty({
    description: 'Teacher user code',
    example: 'GV001',
  })
  userCode: string;

  @ApiProperty({
    description: 'Teacher email address',
    example: 'teacher@example.com',
  })
  email: string;
}

export class ClassMemberSummaryDto {
  @ApiProperty({
    description: 'Membership identifier',
    example: 20,
  })
  id: number;

  @ApiProperty({
    description: 'Student identifier',
    example: 101,
  })
  studentId: number;

  @ApiProperty({
    description: 'Student full name',
    example: 'Nguyen Thi Sinh Vien',
  })
  fullName: string;

  @ApiProperty({
    description: 'Student user code',
    example: 'SV001',
  })
  userCode: string;

  @ApiProperty({
    description: 'Student email address',
    example: 'student@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Timestamp when the student joined the class',
    example: '2026-04-12T09:00:00.000Z',
  })
  joinedAt: Date;
}

export class ClassScheduleResponseDto {
  @ApiProperty({
    description: 'Schedule identifier',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Day of week, where 1 is Monday and 7 is Sunday',
    example: 2,
  })
  dayOfWeek: number;

  @ApiProperty({
    description: 'Schedule start time',
    example: '07:30:00',
  })
  startTime: string;

  @ApiProperty({
    description: 'Schedule end time',
    example: '09:30:00',
  })
  endTime: string;

  @ApiProperty({
    description: 'Room label',
    example: 'A1-204',
  })
  room: string;

  @ApiProperty({
    description: 'Schedule creation timestamp',
    example: '2026-04-12T08:30:00.000Z',
  })
  createdAt: Date;
}

export class ClassResponseDto {
  @ApiProperty({
    description: 'Class identifier',
    example: 5,
  })
  id: number;

  @ApiProperty({
    description: 'Class display name',
    example: 'SE304 - Distributed Systems',
  })
  className: string;

  @ApiProperty({
    description: 'Unique class code',
    example: 'SE304-2026',
  })
  classCode: string;

  @ApiProperty({
    description: 'Teacher identifier managing the class',
    example: 12,
  })
  teacherId: number;

  @ApiPropertyOptional({
    description: 'Optional class description',
    example: 'Main class for the SE304 subject',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Class creation timestamp',
    example: '2026-04-12T08:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Teacher summary information',
    type: () => ClassTeacherSummaryDto,
  })
  teacher: ClassTeacherSummaryDto;

  @ApiProperty({
    description: 'Weekly class schedules',
    type: () => ClassScheduleResponseDto,
    isArray: true,
  })
  schedules: ClassScheduleResponseDto[];

  @ApiProperty({
    description: 'Number of students currently enrolled in the class',
    example: 32,
  })
  memberCount: number;
}

export class ClassDetailResponseDto extends ClassResponseDto {
  @ApiProperty({
    description: 'Students enrolled in the class',
    type: () => ClassMemberSummaryDto,
    isArray: true,
  })
  members: ClassMemberSummaryDto[];
}

export class ActionMessageResponseDto {
  @ApiProperty({
    description: 'Human-readable action result message',
    example: 'Class deleted successfully',
  })
  message: string;
}
