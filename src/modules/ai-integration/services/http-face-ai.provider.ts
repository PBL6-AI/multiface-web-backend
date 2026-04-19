import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import aiConfig from '../../../config/ai.config';
import type {
  FaceAiProvider,
  GenerateFaceEmbeddingsInput,
  GenerateFaceEmbeddingsResult,
  RecognizeFaceInput,
  RecognizeFaceResult,
} from '../interfaces/face-ai-provider.interface';

@Injectable()
export class HttpFaceAiProvider implements FaceAiProvider {
  constructor(
    @Inject(aiConfig.KEY)
    private readonly config: ConfigType<typeof aiConfig>,
  ) {}

  async generateFaceEmbeddings(
    input: GenerateFaceEmbeddingsInput,
  ): Promise<GenerateFaceEmbeddingsResult> {
    return this.post<GenerateFaceEmbeddingsResult>(
      '/face-registration/embeddings',
      input,
    );
  }

  async recognizeFace(input: RecognizeFaceInput): Promise<RecognizeFaceResult> {
    return this.post<RecognizeFaceResult>('/recognition/infer', input);
  }

  private async post<TResponse>(
    path: string,
    payload: unknown,
  ): Promise<TResponse> {
    const abortController = new AbortController();
    const timeoutHandle = setTimeout(
      () => abortController.abort(),
      this.config.timeoutMs,
    );

    try {
      const response = await fetch(`${this.config.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(this.config.authToken
            ? { authorization: `Bearer ${this.config.authToken}` }
            : {}),
        },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new InternalServerErrorException(
          `AI service request failed with status ${response.status}`,
        );
      }

      return (await response.json()) as TResponse;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException('Unable to reach the AI service');
    } finally {
      clearTimeout(timeoutHandle);
    }
  }
}
