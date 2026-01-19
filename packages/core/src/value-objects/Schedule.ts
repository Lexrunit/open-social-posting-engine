/**
 * Schedule value object for post scheduling
 */
export class Schedule {
  private constructor(
    public readonly scheduledAt: Date | null,
    public readonly timezone: string
  ) {}

  static immediate(timezone: string = 'UTC'): Schedule {
    return new Schedule(null, timezone);
  }

  static at(scheduledAt: Date, timezone: string = 'UTC'): Schedule {
    if (scheduledAt <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }
    return new Schedule(scheduledAt, timezone);
  }

  isImmediate(): boolean {
    return this.scheduledAt === null;
  }

  isScheduled(): boolean {
    return this.scheduledAt !== null;
  }

  isPast(): boolean {
    if (!this.scheduledAt) return false;
    return this.scheduledAt <= new Date();
  }

  getDelayMs(): number {
    if (!this.scheduledAt) return 0;
    return Math.max(0, this.scheduledAt.getTime() - Date.now());
  }
}
