import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AttendanceRecordEntity,
  UnknownFaceEntity,
} from '../../../../infrastructure/persistence/typeorm/entities';
import { AttendanceRecordStatus } from '../../../../common/domain/enums';
import type { PendingAttendanceReview, UnknownFace } from '../../core/entities';
import { IExceptionsRepository } from '../../core/interfaces/exceptions.repository.interface';
import { ExceptionsMapper } from './mappers/exceptions.mapper';

@Injectable()
export class ExceptionsTypeOrmRepository implements IExceptionsRepository {
  constructor(
    @InjectRepository(AttendanceRecordEntity)
    private readonly attendanceRecordRepository: Repository<AttendanceRecordEntity>,
    @InjectRepository(UnknownFaceEntity)
    private readonly unknownFaceRepository: Repository<UnknownFaceEntity>,
  ) {}

  async listPendingRecords(
    sessionId: number,
  ): Promise<PendingAttendanceReview[]> {
    const records = await this.attendanceRecordRepository.find({
      where: {
        sessionId,
        status: AttendanceRecordStatus.PENDING,
      },
      order: { recordedAt: 'DESC' },
    });

    return records.map((record) =>
      ExceptionsMapper.toPendingAttendanceReview(record),
    );
  }

  async listUnknownFaces(sessionId: number): Promise<UnknownFace[]> {
    const unknownFaces = await this.unknownFaceRepository.find({
      where: { sessionId },
      order: { detectedAt: 'DESC' },
    });

    return unknownFaces.map((unknownFace) =>
      ExceptionsMapper.toUnknownFace(unknownFace),
    );
  }

  async resolvePendingRecord(
    recordId: number,
    status: AttendanceRecordStatus,
  ): Promise<void> {
    await this.attendanceRecordRepository.update(
      { id: recordId, status: AttendanceRecordStatus.PENDING },
      { status },
    );
  }
}
