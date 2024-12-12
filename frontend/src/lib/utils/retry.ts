interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffFactor?: number;
  retryableErrors?: string[];
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffFactor: 2,
  retryableErrors: [
    'network-request-failed',
    'deadline-exceeded',
    'unavailable'
  ]
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...defaultOptions, ...options };
  let lastError: Error;
  let delay = config.delayMs;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      const errorCode = (error as any).code;

      if (!config.retryableErrors.includes(errorCode)) {
        throw error;
      }

      if (attempt === config.maxAttempts) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= config.backoffFactor;
    }
  }

  throw lastError;
}
