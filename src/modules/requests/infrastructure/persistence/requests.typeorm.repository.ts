import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AppealEntity,
  LeaveRequestEntity,
} from '../../../../infrastructure/persistence/typeorm/entities';
import { ApprovalStatus } from '../../../../common/domain/enums';
import type { Appeal, LeaveRequest } from '../../core/entities';
import { IRequestsRepository } from '../../core/interfaces/requests.repository.interface';
import { RequestsMapper } from './mappers/requests.mapper';

@Injectable()
export class RequestsTypeOrmRepository implements IRequestsRepository {
  constructor(
    @InjectRepository(LeaveRequestEntity)
    private readonly leaveRequestRepository: Repository<LeaveRequestEntity>,
    @InjectRepository(AppealEntity)
    private readonly appealRepository: Repository<AppealEntity>,
  ) {}

  async createLeaveRequest(data: {
    studentId: number;
    classId: number;
    sessionId?: number;
    reason: string;
    evidenceFileId?: number;
  }): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.save(
      this.leaveRequestRepository.create({
        studentId: data.studentId,
        classId: data.classId,
        sessionId: data.sessionId ?? null,
        reason: data.reason,
        evidenceFileId: data.evidenceFileId ?? null,
        status: ApprovalStatus.PENDING,
      }),
    );

    return RequestsMapper.toLeaveRequest(leaveRequest);
  }

  async reviewLeaveRequest(data: {
    requestId: number;
    reviewedById: number;
    status: ApprovalStatus;
  }): Promise<void> {
    await this.leaveRequestRepository.update(
      { id: data.requestId },
      {
        status: data.status,
        reviewedById: data.reviewedById,
        reviewedAt: new Date(),
      },
    );
  }

  async createAppeal(data: {
    studentId: number;
    sessionId: number;
    reason: string;
    evidenceFileId?: number;
  }): Promise<Appeal> {
    const appeal = await this.appealRepository.save(
      this.appealRepository.create({
        studentId: data.studentId,
        sessionId: data.sessionId,
        reason: data.reason,
        evidenceFileId: data.evidenceFileId ?? null,
        status: ApprovalStatus.PENDING,
      }),
    );

    return RequestsMapper.toAppeal(appeal);
  }

  async reviewAppeal(data: {
    appealId: number;
    reviewedById: number;
    status: ApprovalStatus;
  }): Promise<void> {
    await this.appealRepository.update(
      { id: data.appealId },
      {
        status: data.status,
        reviewedById: data.reviewedById,
        reviewedAt: new Date(),
      },
    );
  }
}
