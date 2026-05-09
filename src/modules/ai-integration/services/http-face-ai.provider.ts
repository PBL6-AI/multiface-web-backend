import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import aiConfig from '../../../config/ai.config';
import type {
  AttendancePipelineStatus,
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

  async processEnrollmentVideo(
    input: ProcessEnrollmentVideoInput,
  ): Promise<ProcessEnrollmentVideoResult> {
    return this.post<ProcessEnrollmentVideoResult>(
      '/enrollment/process',
      input,
    );
  }

  async recognizeFace(input: RecognizeFaceInput): Promise<RecognizeFaceResult> {
    return this.post<RecognizeFaceResult>('/recognition/infer', input);
  }

  async startAttendanceSession(
    input: StartAttendanceSessionInput,
  ): Promise<void> {
    await this.post('/attendance/start', input);
  }

  async stopAttendanceSession(sessionId: number): Promise<void> {
    await this.post('/attendance/stop', { sessionId });
  }

  async getAttendanceStatus(): Promise<AttendancePipelineStatus> {
    const abortController = new AbortController();
    const timeoutHandle = setTimeout(
      () => abortController.abort(),
      this.config.timeoutMs,
    );

    try {
      const response = await fetch(`${this.config.baseUrl}/attendance/status`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          ...(this.config.authToken
            ? { authorization: `Bearer ${this.config.authToken}` }
            : {}),
        },
        signal: abortController.signal,
      });

      if (!response.ok) {
        return { is_running: false, source: null };
      }

      return (await response.json()) as AttendancePipelineStatus;
    } catch (_error) {
      return { is_running: false, source: null };
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  private async post<TResponse>(
    path: string,
    payload: unknown,
    baseUrl = this.config.baseUrl,
  ): Promise<TResponse> {
    const abortController = new AbortController();
    const timeoutHandle = setTimeout(
      () => abortController.abort(),
      this.config.timeoutMs,
    );

    try {
      const response = await fetch(`${baseUrl}${path}`, {
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
        const responseBody = await response.text();
        throw new InternalServerErrorException(
          responseBody ||
            `AI service request failed with status ${response.status}`,
        );
      }

      return (await response.json()) as TResponse;
    } catch (_error) {
      if (_error instanceof InternalServerErrorException) {
        throw _error;
      }

      throw new InternalServerErrorException('Unable to reach the AI service');
    } finally {
      clearTimeout(timeoutHandle);
    }
  }
}
