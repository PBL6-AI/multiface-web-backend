import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AttendanceRecordStatus,
  AttendanceSessionStatus,
  AttendanceType,
} from '../../../common/domain/enums';
import type { FaceBoundingBox } from '../../../common/types';

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

  @ApiPropertyOptional({
    description: 'Student full name for dashboard rendering',
    example: 'Nguyen Van A',
    nullable: true,
  })
  fullName?: string | null;

  @ApiPropertyOptional({
    description: 'Student user code for dashboard rendering',
    example: 'SV001',
    nullable: true,
  })
  userCode?: string | null;
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

  @ApiPropertyOptional({
    description: 'Assigned edge device identifier',
    example: 'pi-room-a-01',
    nullable: true,
  })
  sourceDeviceId: string | null;

  @ApiPropertyOptional({
    description: 'Assigned camera identifier',
    example: 'cam-imx519-01',
    nullable: true,
  })
  cameraId: string | null;

  @ApiPropertyOptional({
    description: 'Video source configured for the edge pipeline',
    example: 'libcamera://0',
    nullable: true,
  })
  videoSource: string | null;

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

export class AttendanceSessionLiveEventResponseDto {
  @ApiProperty({
    description: 'Recognition event identifier',
    example: 5001,
  })
  id: number;

  @ApiProperty({
    description: 'Frame identifier',
    example: 'frame-demo-001',
  })
  frameId: string;

  @ApiPropertyOptional({
    description: 'Detected student identifier',
    example: 42,
    nullable: true,
  })
  detectedStudentId: number | null;

  @ApiPropertyOptional({
    description: 'Detected student name when recognition succeeded',
    example: 'Nguyen Van A',
    nullable: true,
  })
  detectedStudentName: string | null;

  @ApiPropertyOptional({
    description: 'Recognition confidence score',
    example: 0.92,
    nullable: true,
  })
  confidenceScore: number | null;

  @ApiPropertyOptional({
    description: 'Recognition similarity score',
    example: 0.87,
    nullable: true,
  })
  similarityScore: number | null;

  @ApiPropertyOptional({
    description: 'Face bounding box in the processed frame',
    example: { x: 120, y: 80, width: 160, height: 160 },
    nullable: true,
  })
  boundingBox: FaceBoundingBox | null;

  @ApiProperty({
    description: 'Whether the face was considered real by anti-spoofing',
    example: true,
  })
  isRealFace: boolean;

  @ApiProperty({
    description: 'Recognition event creation timestamp',
    example: '2026-04-19T09:05:30.000Z',
  })
  createdAt: Date;
}

export class AttendanceSessionLiveSnapshotResponseDto {
  @ApiProperty({
    description: 'Attendance session identifier',
    example: 91,
  })
  sessionId: number;

  @ApiProperty({
    description: 'Current session status',
    enum: AttendanceSessionStatus,
    example: AttendanceSessionStatus.ACTIVE,
  })
  status: AttendanceSessionStatus;

  @ApiProperty({
    description: 'Total students enrolled in the class',
    example: 30,
  })
  totalStudents: number;

  @ApiProperty({
    description: 'Total students marked present',
    example: 18,
  })
  presentCount: number;

  @ApiProperty({
    description: 'Students still pending attendance',
    example: 12,
  })
  pendingCount: number;

  @ApiProperty({
    description: 'Total recognition events recorded in the session',
    example: 24,
  })
  recognitionEventCount: number;

  @ApiProperty({
    description: 'Unknown face count recorded in the session',
    example: 0,
  })
  unknownFaceCount: number;

  @ApiPropertyOptional({
    description: 'Assigned edge device identifier',
    example: 'pi-room-a-01',
    nullable: true,
  })
  sourceDeviceId: string | null;

  @ApiPropertyOptional({
    description: 'Assigned camera identifier',
    example: 'cam-imx519-01',
    nullable: true,
  })
  cameraId: string | null;

  @ApiPropertyOptional({
    description: 'Resolved stream URL used by the remote AI pipeline',
    example: 'rtsp://192.168.1.50:8554/class-a',
    nullable: true,
  })
  videoSource: string | null;

  @ApiPropertyOptional({
    description: 'WebRTC preview URL used by the frontend live monitor',
    example: 'http://192.168.1.50:8889/pi-room-a-01/session-91/',
    nullable: true,
  })
  previewUrl: string | null;

  @ApiPropertyOptional({
    description: 'Current edge device online status',
    example: 'online',
    nullable: true,
  })
  edgeDeviceStatus: string | null;

  @ApiPropertyOptional({
    description: 'Latest heartbeat time received from the assigned edge device',
    example: '2026-05-09T10:30:00.000Z',
    nullable: true,
  })
  edgeLastHeartbeatAt: Date | null;

  @ApiPropertyOptional({
    description: 'Current stream runtime status reported by the edge device',
    example: 'running',
    nullable: true,
  })
  streamStatus: string | null;

  @ApiProperty({
    description:
      'Whether the AI attendance pipeline is currently bound to this session',
    example: true,
  })
  aiPipelineRunning: boolean;

  @ApiPropertyOptional({
    description: 'Realtime AI pipeline metrics when available',
    nullable: true,
  })
  aiMetrics: Record<string, unknown> | null;

  @ApiProperty({
    description: 'Recent recognition events for live monitoring',
    type: AttendanceSessionLiveEventResponseDto,
    isArray: true,
  })
  recentEvents: AttendanceSessionLiveEventResponseDto[];

  @ApiProperty({
    description: 'Students recognized in the session',
    type: AttendanceRecordResponseDto,
    isArray: true,
  })
  recognizedStudents: AttendanceRecordResponseDto[];
}

export class AttendanceDashboardOverviewResponseDto {
  @ApiProperty({
    description: 'Role-specific overview scope',
    example: 'teacher',
  })
  scope: string;

  @ApiProperty({
    description: 'Number of active sessions visible to the current user',
    example: 1,
  })
  activeSessionCount: number;

  @ApiProperty({
    description: 'Number of classes visible to the current user',
    example: 3,
  })
  classCount: number;

  @ApiProperty({
    description: 'Number of present attendance records across visible sessions',
    example: 42,
  })
  presentRecordCount: number;

  @ApiProperty({
    description: 'Number of pending attendance records across visible sessions',
    example: 8,
  })
  pendingRecordCount: number;

  @ApiProperty({
    description: 'Total recognition events across visible sessions',
    example: 67,
  })
  recognitionEventCount: number;

  @ApiProperty({
    description: 'Recent sessions for dashboard cards',
    type: AttendanceSessionResponseDto,
    isArray: true,
  })
  recentSessions: AttendanceSessionResponseDto[];
}

export class StudentAttendanceHistoryResponseDto {
  @ApiProperty({
    description: 'Attendance session identifier',
    example: 91,
  })
  sessionId: number;

  @ApiProperty({
    description: 'Class identifier',
    example: 12,
  })
  classId: number;

  @ApiProperty({
    description: 'Class name',
    example: 'SE304',
  })
  className: string;

  @ApiProperty({
    description: 'Attendance status in the session',
    enum: AttendanceRecordStatus,
    example: AttendanceRecordStatus.PRESENT,
  })
  status: AttendanceRecordStatus;

  @ApiPropertyOptional({
    description: 'Confidence score if attendance was created from recognition',
    example: 0.89,
    nullable: true,
  })
  confidenceScore: number | null;

  @ApiProperty({
    description: 'Session start time',
    example: '2026-04-19T09:00:00.000Z',
  })
  startTime: Date;

  @ApiPropertyOptional({
    description: 'Recorded time of the attendance mark',
    example: '2026-04-19T09:05:30.000Z',
    nullable: true,
  })
  recordedAt: Date | null;
}
