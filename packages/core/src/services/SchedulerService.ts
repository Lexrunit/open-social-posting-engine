import { Job, JobFactory, JobStatus } from '../entities/Job';
import { Schedule } from '../value-objects/Schedule';

/**
 * Scheduler service for managing job scheduling and execution
 */
export class SchedulerService {
  private jobs: Map<string, Job> = new Map();

  /**
   * Schedule a new job
   */
  async scheduleJob(
    id: string,
    type: string,
    data: any,
    schedule: Schedule
  ): Promise<Job> {
    const job = JobFactory.create({
      id,
      type,
      data,
      scheduledAt: schedule.scheduledAt || undefined,
      maxAttempts: 3,
    });

    this.jobs.set(job.id, job);

    return job;
  }

  /**
   * Get job by ID
   */
  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  /**
   * Mark job as started
   */
  startJob(id: string): Job {
    const job = this.jobs.get(id);
    if (!job) {
      throw new Error(`Job not found: ${id}`);
    }

    const updatedJob = JobFactory.markStarted(job);
    this.jobs.set(id, updatedJob);

    return updatedJob;
  }

  /**
   * Mark job as completed
   */
  completeJob(id: string): Job {
    const job = this.jobs.get(id);
    if (!job) {
      throw new Error(`Job not found: ${id}`);
    }

    const updatedJob = JobFactory.markCompleted(job);
    this.jobs.set(id, updatedJob);

    return updatedJob;
  }

  /**
   * Mark job as failed
   */
  failJob(id: string, error: string): Job {
    const job = this.jobs.get(id);
    if (!job) {
      throw new Error(`Job not found: ${id}`);
    }

    const updatedJob = JobFactory.markFailed(job, error);
    this.jobs.set(id, updatedJob);

    return updatedJob;
  }

  /**
   * Get all jobs with specific status
   */
  getJobsByStatus(status: JobStatus): Job[] {
    return Array.from(this.jobs.values()).filter((job) => job.status === status);
  }

  /**
   * Get jobs that are ready to run
   */
  getReadyJobs(): Job[] {
    const now = new Date();
    return Array.from(this.jobs.values()).filter(
      (job) =>
        job.status === JobStatus.PENDING ||
        (job.status === JobStatus.DELAYED &&
          job.scheduledAt &&
          job.scheduledAt <= now)
    );
  }
}
