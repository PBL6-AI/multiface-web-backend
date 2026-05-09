import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JobsOptions, Queue, Worker } from 'bullmq';
import queueConfig from '../../../config/queue.config';
import type { ProcessEnrollmentVideoInput } from '../../ai-integration/interfaces';
import { EnrollmentProcessingWorkerService } from './enrollment-worker.service';

export type EnrollmentJobPayload = ProcessEnrollmentVideoInput;

@Injectable()
export class EnrollmentQueueService implements OnModuleDestroy {
  private readonly queue: Queue<EnrollmentJobPayload>;
  private readonly worker: Worker<EnrollmentJobPayload>;

  constructor(
    @Inject(queueConfig.KEY)
    private readonly config: ConfigType<typeof queueConfig>,
    private readonly workerService: EnrollmentProcessingWorkerService,
  ) {
    const connection = {
      host: this.config.host,
      port: this.config.port,
      username: this.config.username || undefined,
      password: this.config.password || undefined,
      db: this.config.db,
    };

    this.queue = new Queue<EnrollmentJobPayload>(
      this.config.enrollmentQueueName,
      { connection },
    );

    this.worker = new Worker<EnrollmentJobPayload>(
      this.config.enrollmentQueueName,
      async (job) => this.workerService.process(job.data, job.id ?? null),
      { connection },
    );
  }

  async enqueueEnrollmentProcessing(
    payload: EnrollmentJobPayload,
    options?: JobsOptions,
  ) {
    return this.queue.add(`enrollment:${payload.sessionId}`, payload, {
      removeOnComplete: 100,
      removeOnFail: 100,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      ...options,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker.close();
    await this.queue.close();
  }
}
