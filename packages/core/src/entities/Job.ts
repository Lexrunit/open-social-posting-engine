/**
 * Job status enumeration
 */
export enum JobStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled',
}

/**
 * Job entity for queue management
 */
export interface Job {
  id: string;
  type: string;
  data: any;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  error?: string;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Job factory
 */
export class JobFactory {
  static create(data: {
    id: string;
    type: string;
    data: any;
    maxAttempts?: number;
    scheduledAt?: Date;
  }): Job {
    const now = new Date();

    return {
      id: data.id,
      type: data.type,
      data: data.data,
      status: data.scheduledAt ? JobStatus.DELAYED : JobStatus.PENDING,
      attempts: 0,
      maxAttempts: data.maxAttempts || 3,
      scheduledAt: data.scheduledAt,
      createdAt: now,
      updatedAt: now,
    };
  }

  static markStarted(job: Job): Job {
    return {
      ...job,
      status: JobStatus.ACTIVE,
      attempts: job.attempts + 1,
      startedAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static markCompleted(job: Job): Job {
    return {
      ...job,
      status: JobStatus.COMPLETED,
      completedAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static markFailed(job: Job, error: string): Job {
    const shouldRetry = job.attempts < job.maxAttempts;

    return {
      ...job,
      status: shouldRetry ? JobStatus.FAILED : JobStatus.FAILED,
      error,
      updatedAt: new Date(),
    };
  }
}
