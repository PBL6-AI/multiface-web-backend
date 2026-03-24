import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceRecordEntity } from '../../../../infrastructure/persistence/typeorm/entities';
import { AttendanceRecordStatus } from '../../../../common/domain/enums';
import type {
  AttendanceRecord,
  StudentAttendanceSummary,
} from '../../core/entities';
import { IRecordsRepository } from '../../core/interfaces/records.repository.interface';
import { RecordsMapper } from './mappers/records.mapper';

@Injectable()
export class RecordsTypeOrmRepository implements IRecordsRepository {
  constructor(
    @InjectRepository(AttendanceRecordEntity)
    private readonly attendanceRecordRepository: Repository<AttendanceRecordEntity>,
  ) {}

  async listSessionRecords(sessionId: number): Promise<AttendanceRecord[]> {
    const records = await this.attendanceRecordRepository.find({
      where: { sessionId },
      order: { recordedAt: 'DESC' },
    });

    return records.map((record) => RecordsMapper.toAttendanceRecord(record));
  }

  async getStudentSummary(
    studentId: number,
  ): Promise<StudentAttendanceSummary> {
    const records = await this.attendanceRecordRepository.find({
      where: { studentId },
    });

    const present = records.filter(
      (r) => r.status === AttendanceRecordStatus.PRESENT,
    ).length;
    const absent = records.filter(
      (r) => r.status === AttendanceRecordStatus.ABSENT,
    ).length;
    const late = records.filter(
      (r) => r.status === AttendanceRecordStatus.LATE,
    ).length;
    const excused = records.filter(
      (r) => r.status === AttendanceRecordStatus.EXCUSED,
    ).length;
    const pending = records.filter(
      (r) => r.status === AttendanceRecordStatus.PENDING,
    ).length;

    const totalFinalized = present + absent + late + excused;
    const attendanceRate = totalFinalized > 0 ? present / totalFinalized : 0;

    return RecordsMapper.toStudentAttendanceSummary({
      studentId,
      present,
      absent,
      late,
      excused,
      pending,
      attendanceRate,
    });
  }
}
