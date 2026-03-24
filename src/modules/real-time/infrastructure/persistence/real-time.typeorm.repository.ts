import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceRecordEntity } from '../../../../infrastructure/persistence/typeorm/entities';
import { AttendanceRecordStatus } from '../../../../common/domain/enums';
import type { SessionLiveData } from '../../core/entities';
import { IRealTimeRepository } from '../../core/interfaces/real-time.repository.interface';
import { RealTimeMapper } from './mappers/real-time.mapper';

@Injectable()
export class RealTimeTypeOrmRepository implements IRealTimeRepository {
  constructor(
    @InjectRepository(AttendanceRecordEntity)
    private readonly attendanceRecordRepository: Repository<AttendanceRecordEntity>,
  ) {}

  async getSessionLiveData(sessionId: number): Promise<SessionLiveData> {
    const records = await this.attendanceRecordRepository.find({
      where: {
        sessionId,
        status: AttendanceRecordStatus.PRESENT,
      },
      order: { recordedAt: 'DESC' },
    });

    return RealTimeMapper.toSessionLiveData(sessionId, records);
  }
}
