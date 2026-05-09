import { Injectable } from '@nestjs/common';
import {
  EDGEFACE_DEFAULT_MODEL,
  EDGEFACE_DEFAULT_MODEL_VERSION,
  EDGEFACE_DEFAULT_PREPROCESS_PROFILE,
  EDGEFACE_EMBEDDING_DIMENSION,
  SCRFD_DEFAULT_MODEL,
} from '../../../common/constants/ai-model.constants';
import type {
  AttendancePipelineStatus,
  EnrollmentEmbeddingResult,
  FaceAiProvider,
  GenerateFaceEmbeddingsInput,
  GenerateFaceEmbeddingsResult,
  ProcessEnrollmentVideoInput,
  ProcessEnrollmentVideoResult,
  RecognizeFaceInput,
  RecognizeFaceResult,
  StartAttendanceSessionInput,
} from '../interfaces/face-ai-provider.interface';

@Injectable()
export class MockFaceAiProvider implements FaceAiProvider {
  async generateFaceEmbeddings(
    input: GenerateFaceEmbeddingsInput,
  ): Promise<GenerateFaceEmbeddingsResult> {
    return {
      embeddings: input.images.map((image) => ({
        faceImageId: image.faceImageId,
        embedding: this.buildDeterministicEmbedding(
          `${input.studentId}:${image.faceImageId}:${image.pose}`,
        ),
        modelName: EDGEFACE_DEFAULT_MODEL,
        modelVersion: EDGEFACE_DEFAULT_MODEL_VERSION,
        distanceMetric: 'cosine',
        embeddingDimension: EDGEFACE_EMBEDDING_DIMENSION,
        isActive: true,
        preprocessProfile: EDGEFACE_DEFAULT_PREPROCESS_PROFILE,
        isL2Normalized: true,
        metadata: {
          provider: 'mock',
          requestId: input.requestId,
          pose: image.pose,
        },
      })),
    };
  }

  async processEnrollmentVideo(
    input: ProcessEnrollmentVideoInput,
  ): Promise<ProcessEnrollmentVideoResult> {
    const embeddings: EnrollmentEmbeddingResult[] = Array.from(
      { length: 8 },
      (_, index) => ({
        embedding: this.buildDeterministicEmbedding(
          `${input.studentId}:${input.sessionId}:frame:${index}`,
        ),
        qualityScore: 0.8 + index * 0.01,
        yaw: index % 3 === 0 ? 0 : (index - 3) * 4,
        pitch: index % 2 === 0 ? 2 : -2,
        roll: 0,
        frameIndex: index * 5,
        modelName: EDGEFACE_DEFAULT_MODEL,
        modelVersion: EDGEFACE_DEFAULT_MODEL_VERSION,
      }),
    );

    return {
      acceptedFrameCount: 12,
      rejectedFrameStats: {
        no_face: 3,
        multiple_faces: 1,
        blur: 2,
      },
      embeddings,
      prototypeEmbedding: this.averageEmbeddings(
        embeddings.map((item) => item.embedding),
      ),
      prototypeModelName: EDGEFACE_DEFAULT_MODEL,
      prototypeModelVersion: EDGEFACE_DEFAULT_MODEL_VERSION,
      processingStats: {
        sampledFrames: 18,
      },
      thresholdsUsed: {
        duplicateSimilarity: 0.95,
        blurThreshold: 100,
      },
      qualitySummary: {
        averageQualityScore: 0.84,
      },
    };
  }

  async recognizeFace(input: RecognizeFaceInput): Promise<RecognizeFaceResult> {
    return {
      candidateUserId: null,
      matchedEmbeddingId: null,
      confidenceScore: null,
      similarityScore: null,
      isRealFace: true,
      antiSpoofingScore: 0.99,
      detectorModel: SCRFD_DEFAULT_MODEL,
      detectorModelVersion: 'mock',
      recognitionModel: EDGEFACE_DEFAULT_MODEL,
      recognitionModelVersion: EDGEFACE_DEFAULT_MODEL_VERSION,
      antiSpoofingModel: 'mock_liveness_v1',
      antiSpoofingModelVersion: '1',
      boundingBox: input.faceBoundingBox ?? null,
      landmarks: null,
      metadata: {
        provider: 'mock',
        sourceDeviceId: input.sourceDeviceId,
      },
    };
  }

  async startAttendanceSession(
    input: StartAttendanceSessionInput,
  ): Promise<void> {
    console.log(
      `[MockAI] Starting attendance session: ${input.sessionId} (${input.sourceDeviceId ?? 'no-device'})`,
    );
  }

  async stopAttendanceSession(sessionId: number): Promise<void> {
    console.log(`[MockAI] Stopping attendance session: ${sessionId}`);
  }

  async getAttendanceStatus(): Promise<AttendancePipelineStatus> {
    return {
      is_running: true,
      source: 'mock-source',
      sessionId: 1,
      sourceDeviceId: 'mock-edge-device',
      cameraId: 'mock-camera',
      metrics: {
        matches: 0,
      },
    };
  }

  private buildDeterministicEmbedding(seed: string): number[] {
    let state = 0;

    for (const character of seed) {
      state = (state * 31 + character.charCodeAt(0)) >>> 0;
    }

    return Array.from({ length: EDGEFACE_EMBEDDING_DIMENSION }, () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return Number(((state / 0xffffffff) * 2 - 1).toFixed(6));
    });
  }

  private averageEmbeddings(embeddings: number[][]): number[] {
    const sums = new Array(EDGEFACE_EMBEDDING_DIMENSION).fill(0);
    for (const embedding of embeddings) {
      embedding.forEach((value, index) => {
        sums[index] += value;
      });
    }

    const averaged = sums.map((value) => value / embeddings.length);
    const norm = Math.sqrt(
      averaged.reduce((total, value) => total + value * value, 0),
    );

    return averaged.map((value) =>
      Number((value / Math.max(norm, 1e-10)).toFixed(6)),
    );
  }
}
