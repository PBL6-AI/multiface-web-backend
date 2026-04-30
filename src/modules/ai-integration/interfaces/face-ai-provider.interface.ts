import { FaceImagePose } from '../../../common/domain/enums';
import type { FaceBoundingBox } from '../../../common/types';

export type GenerateFaceEmbeddingsInput = {
  requestId: number;
  studentId: number;
  images: Array<{
    faceImageId: number;
    url: string;
    pose: FaceImagePose;
  }>;
};

export type GeneratedFaceEmbedding = {
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

export type GenerateFaceEmbeddingsResult = {
  embeddings: GeneratedFaceEmbedding[];
};

export type RecognizeFaceInput = {
  sessionId: number;
  sourceDeviceId: string;
  frameId: string;
  imageFileKey?: string | null;
  imageFileId?: number | null;
  faceBoundingBox?: FaceBoundingBox | null;
  metadata?: Record<string, unknown> | null;
};

export type RecognizeFaceResult = {
  candidateUserId: number | null;
  matchedEmbeddingId: number | null;
  confidenceScore: number | null;
  similarityScore: number | null;
  isRealFace: boolean;
  antiSpoofingScore: number | null;
  detectorModel: string;
  detectorModelVersion: string | null;
  recognitionModel: string;
  recognitionModelVersion: string;
  antiSpoofingModel: string | null;
  antiSpoofingModelVersion: string | null;
  boundingBox: FaceBoundingBox | null;
  landmarks: Array<{ x: number; y: number }> | null;
  metadata?: Record<string, unknown> | null;
};

export interface FaceAiProvider {
  generateFaceEmbeddings(
    input: GenerateFaceEmbeddingsInput,
  ): Promise<GenerateFaceEmbeddingsResult>;
  recognizeFace(input: RecognizeFaceInput): Promise<RecognizeFaceResult>;
  startAttendanceSession(sessionId: number): Promise<void>;
  stopAttendanceSession(sessionId: number): Promise<void>;
  getAttendanceStatus(): Promise<{
    is_running: boolean;
    source: string | null;
  }>;
}
