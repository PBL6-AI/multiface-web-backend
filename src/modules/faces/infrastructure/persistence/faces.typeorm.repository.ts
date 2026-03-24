import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FaceEmbeddingEntity,
  FaceImageEntity,
  FaceRegistrationRequestEntity,
} from '../../../../infrastructure/persistence/typeorm/entities';
import { ApprovalStatus } from '../../../../common/domain/enums';
import type { FaceImage } from '../../core/entities';
import { IFacesRepository } from '../../core/interfaces/faces.repository.interface';
import { FacesMapper } from './mappers/faces.mapper';

@Injectable()
export class FacesTypeOrmRepository implements IFacesRepository {
  constructor(
    @InjectRepository(FaceRegistrationRequestEntity)
    private readonly requestRepository: Repository<FaceRegistrationRequestEntity>,
    @InjectRepository(FaceImageEntity)
    private readonly faceImageRepository: Repository<FaceImageEntity>,
    @InjectRepository(FaceEmbeddingEntity)
    private readonly faceEmbeddingRepository: Repository<FaceEmbeddingEntity>,
  ) {}

  async ensureRegistrationRequest(studentId: number): Promise<number> {
    const existingRequest = await this.requestRepository.findOne({
      where: {
        studentId,
        status: ApprovalStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });

    if (existingRequest) {
      return existingRequest.id;
    }

    const request = await this.requestRepository.save(
      this.requestRepository.create({
        studentId,
        status: ApprovalStatus.PENDING,
      }),
    );

    return request.id;
  }

  async createFaceImage(data: {
    studentId: number;
    requestId: number;
    fileId: number;
  }): Promise<FaceImage> {
    const faceImage = await this.faceImageRepository.save(
      this.faceImageRepository.create({
        studentId: data.studentId,
        requestId: data.requestId,
        fileId: data.fileId,
        status: ApprovalStatus.PENDING,
      }),
    );

    return FacesMapper.toFaceImage(faceImage);
  }

  async reviewFaceImage(data: {
    imageId: number;
    status: ApprovalStatus;
    reviewedById: number;
    rejectionReason?: string;
  }): Promise<FaceImage | null> {
    const faceImage = await this.faceImageRepository.findOne({
      where: { id: data.imageId },
    });

    if (!faceImage) {
      return null;
    }

    faceImage.status = data.status;
    faceImage.reviewedById = data.reviewedById;
    faceImage.reviewedAt = new Date();
    faceImage.rejectionReason =
      data.status === ApprovalStatus.REJECTED
        ? (data.rejectionReason ?? 'Rejected by reviewer')
        : null;

    const savedFaceImage = await this.faceImageRepository.save(faceImage);

    await this.requestRepository.update(
      { id: savedFaceImage.requestId },
      {
        status: savedFaceImage.status,
        reviewedById: savedFaceImage.reviewedById,
        reviewedAt: savedFaceImage.reviewedAt,
        rejectionReason: savedFaceImage.rejectionReason,
      },
    );

    return FacesMapper.toFaceImage(savedFaceImage);
  }

  async saveEmbedding(data: {
    studentId: number;
    faceImageId: number;
    embedding: number[];
  }): Promise<void> {
    await this.faceEmbeddingRepository.save(
      this.faceEmbeddingRepository.create({
        studentId: data.studentId,
        faceImageId: data.faceImageId,
        embedding: data.embedding,
      }),
    );
  }
}
