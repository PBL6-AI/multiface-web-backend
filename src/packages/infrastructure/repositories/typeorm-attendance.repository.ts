import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REPOSITORY_TOKENS } from '../../../common/constants';
import type {
  AttendanceRepository,
  CreateAttendanceRecordRecordInput,
  CreateAttendanceSessionRecordInput,
  CreateRecognitionEventRecordInput,
  RawAttendanceRecordEntity,
  RawAttendanceSessionEntity,
  RawClassEntity,
  RawRecognitionEventEntity,
} from '../../domain';
import {
  AttendanceRecordEntity,
  AttendanceSessionEntity,
  ClassEntity,
  RecognitionEventEntity,
} from '../entities';

export class TypeOrmAttendanceRepository implements AttendanceRepository {
  constructor(
    private readonly attendanceSessionsRepository: Repository<AttendanceSessionEntity>,
    private readonly attendanceRecordsRepository: Repository<AttendanceRecordEntity>,
    private readonly recognitionEventsRepository: Repository<RecognitionEventEntity>,
    private readonly classesRepository: Repository<ClassEntity>,
  ) {}

  async createSession(
    input: CreateAttendanceSessionRecordInput,
  ): Promise<RawAttendanceSessionEntity> {
    const savedSession = await this.attendanceSessionsRepository.save(
      this.attendanceSessionsRepository.create({
        classId: input.classId,
        createdById: input.createdById,
        startTime: input.startTime,
        endTime: input.endTime ?? null,
        attendanceType: input.attendanceType,
        confidenceThreshold: input.confidenceThreshold ?? null,
        sourceDeviceId: input.sourceDeviceId ?? null,
        cameraId: input.cameraId ?? null,
        videoSource: input.videoSource ?? null,
        status: input.status,
      }),
    );

    const session = await this.findSessionById(savedSession.id);

    if (!session) {
      throw new Error('Attendance session was created but not reloaded');
    }

    return session;
  }

  async findSessionById(
    sessionId: number,
  ): Promise<RawAttendanceSessionEntity | null> {
    return this.attendanceSessionsRepository.findOne({
      where: { id: sessionId },
      relations: this.sessionRelations,
    });
  }

  async listSessions(): Promise<RawAttendanceSessionEntity[]> {
    return this.attendanceSessionsRepository.find({
      relations: this.sessionRelations,
      order: {
        startTime: 'DESC',
      },
    });
  }

  async saveSession(
    session: RawAttendanceSessionEntity,
  ): Promise<RawAttendanceSessionEntity> {
    const savedSession = await this.attendanceSessionsRepository.save(session);
    const reloadedSession = await this.findSessionById(savedSession.id);

    if (!reloadedSession) {
      throw new Error('Attendance session was saved but not reloaded');
    }

    return reloadedSession;
  }

  async findClassById(classId: number): Promise<RawClassEntity | null> {
    return this.classesRepository.findOne({
      where: { id: classId },
      relations: {
        attendanceSessions: true,
        teacher: {
          role: true,
        },
        schedules: true,
        classMembers: {
          student: {
            role: true,
          },
        },
      },
    });
  }

  async createRecognitionEvent(
    input: CreateRecognitionEventRecordInput,
  ): Promise<RawRecognitionEventEntity> {
    return this.recognitionEventsRepository.save(
      this.recognitionEventsRepository.create({
        sessionId: input.sessionId,
        frameId: input.frameId,
        imageFileId: input.imageFileId ?? null,
        detectedStudentId: input.detectedStudentId ?? null,
        matchedEmbeddingId: input.matchedEmbeddingId ?? null,
        confidenceScore: input.confidenceScore ?? null,
        similarityScore: input.similarityScore ?? null,
        isRealFace: input.isRealFace,
        antiSpoofingScore: input.antiSpoofingScore ?? null,
        boundingBox: input.boundingBox ?? null,
        landmarks: input.landmarks ?? null,
        detectorModel: input.detectorModel,
        detectorModelVersion: input.detectorModelVersion ?? null,
        recognitionModel: input.recognitionModel,
        recognitionModelVersion: input.recognitionModelVersion,
        antiSpoofingModel: input.antiSpoofingModel ?? null,
        antiSpoofingModelVersion: input.antiSpoofingModelVersion ?? null,
        metadata: input.metadata ?? null,
      }),
    );
  }

  async findAttendanceRecord(
    sessionId: number,
    studentId: number,
  ): Promise<RawAttendanceRecordEntity | null> {
    return this.attendanceRecordsRepository.findOne({
      where: { sessionId, studentId },
      relations: this.attendanceRecordRelations,
    });
  }

  async createAttendanceRecord(
    input: CreateAttendanceRecordRecordInput,
  ): Promise<RawAttendanceRecordEntity> {
    return this.attendanceRecordsRepository.save(
      this.attendanceRecordsRepository.create({
        sessionId: input.sessionId,
        studentId: input.studentId,
        status: input.status,
        confidenceScore: input.confidenceScore ?? null,
        imageFileId: input.imageFileId ?? null,
        recognitionEventId: input.recognitionEventId ?? null,
      }),
    );
  }

  async saveAttendanceRecord(
    record: RawAttendanceRecordEntity,
  ): Promise<RawAttendanceRecordEntity> {
    return this.attendanceRecordsRepository.save(record);
  }

  private readonly sessionRelations = {
    classEntity: {
      teacher: {
        role: true,
      },
      classMembers: {
        student: {
          role: true,
        },
      },
    },
    createdBy: {
      role: true,
    },
    records: {
      student: {
        role: true,
      },
      imageFile: true,
      recognitionEvent: true,
    },
    recognitionEvents: {
      imageFile: true,
      detectedStudent: {
        role: true,
      },
      matchedEmbedding: true,
    },
  } as const;

  private readonly attendanceRecordRelations = {
    student: {
      role: true,
    },
    imageFile: true,
    recognitionEvent: true,
  } as const;
}

export const useAttendanceRepository = () => ({
  provide: REPOSITORY_TOKENS.ATTENDANCE,
  useFactory: (
    attendanceSessionsRepository: Repository<AttendanceSessionEntity>,
    attendanceRecordsRepository: Repository<AttendanceRecordEntity>,
    recognitionEventsRepository: Repository<RecognitionEventEntity>,
    classesRepository: Repository<ClassEntity>,
  ) =>
    new TypeOrmAttendanceRepository(
      attendanceSessionsRepository,
      attendanceRecordsRepository,
      recognitionEventsRepository,
      classesRepository,
    ),
  inject: [
    getRepositoryToken(AttendanceSessionEntity),
    getRepositoryToken(AttendanceRecordEntity),
    getRepositoryToken(RecognitionEventEntity),
    getRepositoryToken(ClassEntity),
  ],
});
