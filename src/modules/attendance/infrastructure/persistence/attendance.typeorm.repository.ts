import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AttendanceRecordEntity,
  AttendanceSessionEntity,
  RecognitionEventEntity,
} from '../../../../infrastructure/persistence/typeorm/entities';
import {
  AttendanceRecordStatus,
  AttendanceSessionStatus,
  AttendanceType,
} from '../../../../common/domain/enums';
import type { AttendanceSession } from '../../core/entities';
import { IAttendanceRepository } from '../../core/interfaces/attendance.repository.interface';
import { AttendanceMapper } from './mappers/attendance.mapper';

@Injectable()
export class AttendanceTypeOrmRepository implements IAttendanceRepository {
  constructor(
    @InjectRepository(AttendanceSessionEntity)
    private readonly sessionRepository: Repository<AttendanceSessionEntity>,
    @InjectRepository(RecognitionEventEntity)
    private readonly recognitionRepository: Repository<RecognitionEventEntity>,
    @InjectRepository(AttendanceRecordEntity)
    private readonly recordRepository: Repository<AttendanceRecordEntity>,
  ) {}

  async createSession(data: {
    classId: number;
    createdById: number;
    startTime: Date;
    endTime?: Date;
    attendanceType: AttendanceType;
    confidenceThreshold?: number;
  }): Promise<AttendanceSession> {
    const session = await this.sessionRepository.save(
      this.sessionRepository.create({
        classId: data.classId,
        createdById: data.createdById,
        startTime: data.startTime,
        endTime: data.endTime ?? null,
        attendanceType: data.attendanceType,
        confidenceThreshold: data.confidenceThreshold ?? 0.7,
        status: AttendanceSessionStatus.ACTIVE,
      }),
    );

    return AttendanceMapper.toAttendanceSession(session);
  }

  async addRecognitionEvent(data: {
    sessionId: number;
    frameId: string;
    imageFileId?: number;
    detectedStudentId?: number;
    confidenceScore?: number;
    isRealFace: boolean;
  }): Promise<void> {
    await this.recognitionRepository.save(
      this.recognitionRepository.create({
        sessionId: data.sessionId,
        frameId: data.frameId,
        imageFileId: data.imageFileId ?? null,
        detectedStudentId: data.detectedStudentId ?? null,
        confidenceScore: data.confidenceScore ?? null,
        isRealFace: data.isRealFace,
      }),
    );
  }

  async hasAttendanceRecord(
    sessionId: number,
    studentId: number,
  ): Promise<boolean> {
    const record = await this.recordRepository.findOne({
      where: {
        sessionId,
        studentId,
        status: AttendanceRecordStatus.PRESENT,
      },
    });

    return Boolean(record);
  }

  async markAttendance(data: {
    sessionId: number;
    studentId: number;
    status: AttendanceRecordStatus;
    confidenceScore?: number;
    imageFileId?: number;
  }): Promise<void> {
    await this.recordRepository.save(
      this.recordRepository.create({
        sessionId: data.sessionId,
        studentId: data.studentId,
        status: data.status,
        confidenceScore: data.confidenceScore ?? null,
        imageFileId: data.imageFileId ?? null,
      }),
    );
  }
}
