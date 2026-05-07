import {
  ApprovalStatus,
  FaceImagePose,
  FaceRegistrationEmbeddingStatus,
  FaceRegistrationSessionStatus,
} from '../../../common/domain/enums';
import type {
  RawFaceEmbeddingEntity,
  RawFaceImageEntity,
  RawFaceRegistrationRequestEntity,
} from '../entities';

export type CreateFaceRegistrationRequestRecordInput = {
  studentId: number;
  status?: ApprovalStatus;
  sessionStatus?: FaceRegistrationSessionStatus;
  embeddingStatus?: FaceRegistrationEmbeddingStatus;
  targetCountPerPose?: number;
  completedAt?: Date | null;
  metadata?: Record<string, unknown> | null;
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
  studentId?: number;
  sessionStatus?: FaceRegistrationSessionStatus;
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
  findSessionById(
    sessionId: number,
  ): Promise<RawFaceRegistrationRequestEntity | null>;
  findLatestSessionByStudentId(
    studentId: number,
  ): Promise<RawFaceRegistrationRequestEntity | null>;
  findActiveSessionByStudentId(
    studentId: number,
  ): Promise<RawFaceRegistrationRequestEntity | null>;
  createSession(
    input: CreateFaceRegistrationRequestRecordInput,
  ): Promise<RawFaceRegistrationRequestEntity>;
  createSample(input: CreateFaceImageRecordInput): Promise<RawFaceImageEntity>;
  countSessionSamples(sessionId: number): Promise<number>;
  countSessionSamplesByPose(
    sessionId: number,
    pose: FaceImagePose,
  ): Promise<number>;
  listSessions(
    options?: ListFaceRegistrationRequestsOptions,
  ): Promise<RawFaceRegistrationRequestEntity[]>;
  saveSession(
    session: RawFaceRegistrationRequestEntity,
  ): Promise<RawFaceRegistrationRequestEntity>;
  saveSamples(images: RawFaceImageEntity[]): Promise<RawFaceImageEntity[]>;
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
