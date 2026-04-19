import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AttendanceRecordStatus,
  AttendanceSessionStatus,
  AttendanceType,
} from '../../../common/domain/enums';

export class AttendanceRecordResponseDto {
  @ApiProperty({
    description: 'Attendance record identifier',
    example: 701,
  })
  id: number;

  @ApiProperty({
    description: 'Student identifier',
    example: 42,
  })
  studentId: number;

  @ApiProperty({
    description: 'Attendance status for the student in the session',
    enum: AttendanceRecordStatus,
    example: AttendanceRecordStatus.PRESENT,
  })
  status: AttendanceRecordStatus;

  @ApiPropertyOptional({
    description:
      'Recognition confidence score recorded with the attendance mark',
    example: 0.91,
    nullable: true,
  })
  confidenceScore: number | null;

  @ApiPropertyOptional({
    description: 'Linked recognition event identifier',
    example: 5001,
    nullable: true,
  })
  recognitionEventId: number | null;

  @ApiProperty({
    description: 'Timestamp when the attendance record was stored',
    example: '2026-04-19T09:05:30.000Z',
  })
  recordedAt: Date;
}

export class AttendanceSessionResponseDto {
  @ApiProperty({
    description: 'Attendance session identifier',
    example: 91,
  })
  id: number;

  @ApiProperty({
    description: 'Class identifier of the session',
    example: 12,
  })
  classId: number;

  @ApiProperty({
    description: 'Class name',
    example: 'SE304',
  })
  className: string;

  @ApiProperty({
    description: 'Creator user identifier',
    example: 7,
  })
  createdById: number;

  @ApiProperty({
    description: 'Session start time',
    example: '2026-04-19T09:00:00.000Z',
  })
  startTime: Date;

  @ApiPropertyOptional({
    description: 'Session end time, if the session has been closed',
    example: '2026-04-19T09:20:00.000Z',
    nullable: true,
  })
  endTime: Date | null;

  @ApiProperty({
    description: 'Attendance mode',
    enum: AttendanceType,
    example: AttendanceType.AUTOMATIC,
  })
  attendanceType: AttendanceType;

  @ApiPropertyOptional({
    description: 'Confidence threshold configured for the session',
    example: 0.8,
    nullable: true,
  })
  confidenceThreshold: number | null;

  @ApiProperty({
    description: 'Current session status',
    enum: AttendanceSessionStatus,
    example: AttendanceSessionStatus.ACTIVE,
  })
  status: AttendanceSessionStatus;

  @ApiProperty({
    description: 'Number of enrolled students in the class',
    example: 38,
  })
  classMemberCount: number;

  @ApiProperty({
    description: 'Number of stored recognition events for the session',
    example: 12,
  })
  recognitionEventCount: number;

  @ApiProperty({
    description: 'Number of present attendance records in the session',
    example: 10,
  })
  presentCount: number;

  @ApiProperty({
    description: 'Stored attendance records for the session',
    type: AttendanceRecordResponseDto,
    isArray: true,
  })
  records: AttendanceRecordResponseDto[];
}

export class RecognitionEventIngestionResponseDto {
  @ApiProperty({
    description: 'Stored recognition event identifier',
    example: 5001,
  })
  recognitionEventId: number;

  @ApiPropertyOptional({
    description:
      'Linked attendance record identifier when a student was marked present',
    example: 701,
    nullable: true,
  })
  attendanceRecordId: number | null;

  @ApiProperty({
    description: 'Business decision produced by the backend',
    example: 'attendance_marked',
  })
  decision: string;

  @ApiProperty({
    description: 'Human-readable reason describing the decision',
    example: 'Recognition event accepted and attendance recorded',
  })
  reason: string;
}

export class AttendanceActionMessageResponseDto {
  @ApiProperty({
    description: 'Action result message',
    example: 'Attendance session closed successfully',
  })
  message: string;
}
