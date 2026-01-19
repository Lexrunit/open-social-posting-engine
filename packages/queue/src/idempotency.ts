import { createHash } from 'crypto';

/**
 * Idempotency key manager
 * Prevents duplicate job execution
 */
export class IdempotencyManager {
  private processedKeys: Map<string, { timestamp: number; result?: any }> =
    new Map();
  private ttl: number;

  constructor(ttlMs: number = 1000 * 60 * 60 * 24) {
    // 24 hours default
    this.ttl = ttlMs;
  }

  /**
   * Generate idempotency key from data
   */
  generateKey(data: any): string {
    const hash = createHash('sha256');
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
  }

  /**
   * Check if operation has been processed
   */
  hasBeenProcessed(key: string): boolean {
    const entry = this.processedKeys.get(key);
    if (!entry) return false;

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.processedKeys.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get cached result for processed operation
   */
  getResult(key: string): any | null {
    const entry = this.processedKeys.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.processedKeys.delete(key);
      return null;
    }

    return entry.result;
  }

  /**
   * Mark operation as processed
   */
  markProcessed(key: string, result?: any): void {
    this.processedKeys.set(key, {
      timestamp: Date.now(),
      result,
    });
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.processedKeys.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.processedKeys.delete(key);
      }
    }
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.processedKeys.clear();
  }
}
