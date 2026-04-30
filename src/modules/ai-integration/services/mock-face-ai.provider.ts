import { Injectable } from '@nestjs/common';
import {
  EDGEFACE_DEFAULT_MODEL,
  EDGEFACE_DEFAULT_MODEL_VERSION,
  EDGEFACE_DEFAULT_PREPROCESS_PROFILE,
  EDGEFACE_EMBEDDING_DIMENSION,
  SCRFD_DEFAULT_MODEL,
} from '../../../common/constants/ai-model.constants';
import type {
  FaceAiProvider,
  GenerateFaceEmbeddingsInput,
  GenerateFaceEmbeddingsResult,
  RecognizeFaceInput,
  RecognizeFaceResult,
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

  async startAttendanceSession(sessionId: number): Promise<void> {
    console.log(`[MockAI] Starting attendance session: ${sessionId}`);
  }

  async stopAttendanceSession(sessionId: number): Promise<void> {
    console.log(`[MockAI] Stopping attendance session: ${sessionId}`);
  }

  async getAttendanceStatus(): Promise<{
    is_running: boolean;
    source: string | null;
  }> {
    return { is_running: true, source: 'mock-source' };
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
}
