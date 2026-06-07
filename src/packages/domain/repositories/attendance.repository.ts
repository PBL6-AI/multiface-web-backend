import {
  AttendanceRecordStatus,
  AttendanceSessionStatus,
  AttendanceType,
} from '../../../common/domain/enums';
import type {
  RawAttendanceRecordEntity,
  RawAttendanceSessionEntity,
  RawClassEntity,
  RawRecognitionEventEntity,
} from '../entities';

export type CreateAttendanceSessionRecordInput = {
  classId: number;
  createdById: number;
  startTime: Date;
  endTime?: Date | null;
  attendanceType?: AttendanceType;
  confidenceThreshold?: number | null;
  sourceDeviceId?: string | null;
  cameraId?: string | null;
  videoSource?: string | null;
  status?: AttendanceSessionStatus;
};

export type CreateRecognitionEventRecordInput = {
  sessionId: number;
  frameId: string;
  imageFileId?: number | null;
  detectedStudentId?: number | null;
  matchedEmbeddingId?: number | null;
  confidenceScore?: number | null;
  similarityScore?: number | null;
  isRealFace: boolean;
  antiSpoofingScore?: number | null;
  boundingBox?: Record<string, unknown> | null;
  landmarks?: Array<{ x: number; y: number }> | null;
  detectorModel: string;
  detectorModelVersion?: string | null;
  recognitionModel: string;
  recognitionModelVersion: string;
  antiSpoofingModel?: string | null;
  antiSpoofingModelVersion?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type CreateAttendanceRecordRecordInput = {
  sessionId: number;
  studentId: number;
  status: AttendanceRecordStatus;
  confidenceScore?: number | null;
  imageFileId?: number | null;
  recognitionEventId?: number | null;
};

export type ActiveAttendanceSessionMonitorRecord = Pick<
  RawAttendanceSessionEntity,
  | 'id'
  | 'sourceDeviceId'
  | 'cameraId'
  | 'videoSource'
  | 'confidenceThreshold'
  | 'status'
>;

export interface AttendanceRepository {
  createSession(
    input: CreateAttendanceSessionRecordInput,
  ): Promise<RawAttendanceSessionEntity>;
  findSessionById(
    sessionId: number,
  ): Promise<RawAttendanceSessionEntity | null>;
  listSessions(): Promise<RawAttendanceSessionEntity[]>;
  listActiveSessionsForMonitor(): Promise<
    ActiveAttendanceSessionMonitorRecord[]
  >;
  saveSession(
    session: RawAttendanceSessionEntity,
  ): Promise<RawAttendanceSessionEntity>;
  findClassById(classId: number): Promise<RawClassEntity | null>;
  createRecognitionEvent(
    input: CreateRecognitionEventRecordInput,
  ): Promise<RawRecognitionEventEntity>;
  findAttendanceRecord(
    sessionId: number,
    studentId: number,
  ): Promise<RawAttendanceRecordEntity | null>;
  createAttendanceRecord(
    input: CreateAttendanceRecordRecordInput,
  ): Promise<RawAttendanceRecordEntity>;
  saveAttendanceRecord(
    record: RawAttendanceRecordEntity,
  ): Promise<RawAttendanceRecordEntity>;
}
