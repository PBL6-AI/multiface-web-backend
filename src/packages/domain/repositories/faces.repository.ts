import { ApprovalStatus, FaceImagePose } from '../../../common/domain/enums';
import type {
  RawFaceEmbeddingEntity,
  RawFaceImageEntity,
  RawFaceRegistrationRequestEntity,
} from '../entities';

export type CreateFaceRegistrationRequestRecordInput = {
  studentId: number;
  status?: ApprovalStatus;
};

export type CreateFaceImageRecordInput = {
  studentId: number;
  requestId: number;
  fileId: number;
  alignedFileId?: number | null;
  pose: FaceImagePose;
  status?: ApprovalStatus;
  reviewedById?: number | null;
  reviewedAt?: Date | null;
  rejectionReason?: string | null;
  captureSource?: string;
  qualityScore?: number | null;
  capturedAt?: Date | null;
  metadata?: Record<string, unknown> | null;
};

export type ListFaceRegistrationRequestsOptions = {
  status?: ApprovalStatus;
  studentId?: number;
};

export type CreateFaceEmbeddingRecordInput = {
  studentId: number;
  faceImageId: number;
  embedding: number[];
  modelName: string;
  modelVersion: string;
  distanceMetric: string;
  embeddingDimension: number;
  isActive: boolean;
  preprocessProfile: string;
  isL2Normalized: boolean;
  metadata?: Record<string, unknown> | null;
};

export type ClosestEmbeddingResult = {
  studentId: number;
  embeddingId: number;
  similarity: number;
};

export interface FacesRepository {
  findRequestById(
    requestId: number,
  ): Promise<RawFaceRegistrationRequestEntity | null>;
  findLatestRequestByStudentId(
    studentId: number,
  ): Promise<RawFaceRegistrationRequestEntity | null>;
  findPendingRequestByStudentId(
    studentId: number,
  ): Promise<RawFaceRegistrationRequestEntity | null>;
  createRequest(
    input: CreateFaceRegistrationRequestRecordInput,
  ): Promise<RawFaceRegistrationRequestEntity>;
  createFaceImage(
    input: CreateFaceImageRecordInput,
  ): Promise<RawFaceImageEntity>;
  findRequestImageByPose(
    requestId: number,
    pose: FaceImagePose,
  ): Promise<RawFaceImageEntity | null>;
  countRequestImages(requestId: number): Promise<number>;
  listRequests(
    options?: ListFaceRegistrationRequestsOptions,
  ): Promise<RawFaceRegistrationRequestEntity[]>;
  saveRequest(
    request: RawFaceRegistrationRequestEntity,
  ): Promise<RawFaceRegistrationRequestEntity>;
  saveImages(images: RawFaceImageEntity[]): Promise<RawFaceImageEntity[]>;
  createEmbeddings(
    inputs: CreateFaceEmbeddingRecordInput[],
  ): Promise<RawFaceEmbeddingEntity[]>;
  deleteEmbeddingsByFaceImageIds(faceImageIds: number[]): Promise<void>;
  findClosestEmbedding(
    embedding: number[],
    studentIds: number[],
    limit?: number,
  ): Promise<ClosestEmbeddingResult[]>;
}
