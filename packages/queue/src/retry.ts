/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  multiplier: number;
}

/**
 * Default retry configuration
 */
export const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 5000, // 5 seconds
  maxDelay: 300000, // 5 minutes
  multiplier: 2,
};

/**
 * Calculate exponential backoff delay
 */
export function calculateBackoff(
  attempt: number,
  config: RetryConfig = defaultRetryConfig
): number {
  const delay = config.baseDelay * Math.pow(config.multiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

/**
 * Retry handler with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = defaultRetryConfig,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < config.maxAttempts) {
        const delay = calculateBackoff(attempt, config);
        
        if (onRetry) {
          onRetry(attempt, lastError);
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true;
  }

  // HTTP errors
  if (error.response) {
    const status = error.response.status;
    // Retry on 5xx and 429 (rate limit)
    return status >= 500 || status === 429;
  }

  return false;
}
