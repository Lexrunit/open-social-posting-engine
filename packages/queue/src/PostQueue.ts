import { Queue, Worker, QueueEvents, Job as BullJob } from 'bullmq';
import { Job, JobFactory, JobStatus } from '@open-social/core';
import Redis from 'ioredis';

/**
 * Queue configuration
 */
export interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  defaultJobOptions?: {
    attempts?: number;
    backoff?: {
      type: 'exponential' | 'fixed';
      delay: number;
    };
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
  };
}

/**
 * Post publishing queue
 */
export class PostQueue {
  private queue: Queue;
  private worker: Worker | null = null;
  private queueEvents: QueueEvents;
  private connection: Redis;

  constructor(config: QueueConfig) {
    this.connection = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: null,
    });

    this.queue = new Queue('post-publishing', {
      connection: this.connection,
      defaultJobOptions: {
        attempts: config.defaultJobOptions?.attempts || 3,
        backoff: config.defaultJobOptions?.backoff || {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: config.defaultJobOptions?.removeOnComplete ?? true,
        removeOnFail: config.defaultJobOptions?.removeOnFail ?? false,
      },
    });

    this.queueEvents = new QueueEvents('post-publishing', {
      connection: this.connection,
    });
  }

  /**
   * Add job to queue
   */
  async addJob(
    jobId: string,
    data: any,
    options?: {
      delay?: number;
      priority?: number;
    }
  ): Promise<void> {
    await this.queue.add('publish-post', data, {
      jobId,
      delay: options?.delay,
      priority: options?.priority,
    });
  }

  /**
   * Schedule job for future execution
   */
  async scheduleJob(
    jobId: string,
    data: any,
    scheduledAt: Date
  ): Promise<void> {
    const delay = Math.max(0, scheduledAt.getTime() - Date.now());
    await this.addJob(jobId, data, { delay });
  }

  /**
   * Start worker to process jobs
   */
  startWorker(processor: (job: BullJob) => Promise<any>): void {
    this.worker = new Worker('post-publishing', processor, {
      connection: this.connection,
    });

    this.worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed:`, err);
    });
  }

  /**
   * Stop worker
   */
  async stopWorker(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<JobStatus | null> {
    const job = await this.queue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();

    switch (state) {
      case 'completed':
        return JobStatus.COMPLETED;
      case 'failed':
        return JobStatus.FAILED;
      case 'active':
        return JobStatus.ACTIVE;
      case 'delayed':
        return JobStatus.DELAYED;
      case 'waiting':
        return JobStatus.PENDING;
      default:
        return JobStatus.PENDING;
    }
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = await this.queue.getJob(jobId);
    if (!job) return false;

    await job.remove();
    return true;
  }

  /**
   * Retry failed job
   */
  async retryJob(jobId: string): Promise<boolean> {
    const job = await this.queue.getJob(jobId);
    if (!job) return false;

    await job.retry();
    return true;
  }

  /**
   * Get queue metrics
   */
  async getMetrics(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Clean old jobs
   */
  async cleanJobs(
    grace: number = 1000 * 60 * 60 * 24 // 24 hours
  ): Promise<void> {
    await this.queue.clean(grace, 100, 'completed');
    await this.queue.clean(grace * 7, 100, 'failed'); // Keep failed jobs longer
  }

  /**
   * Close queue connections
   */
  async close(): Promise<void> {
    await this.stopWorker();
    await this.queue.close();
    await this.queueEvents.close();
    await this.connection.quit();
  }
}
