/**
 * Error handling utilities
 */

/**
 * Custom error class for bet validation errors
 */
export class BetValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BetValidationError';
  }
}

/**
 * Custom error class for session errors
 */
export class SessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionError';
  }
}

/**
 * Safely execute a function with error handling
 * @param fn Function to execute
 * @param fallback Fallback value if function throws
 * @param context Context description for logging
 * @returns Result of function or fallback value
 */
export function safeExecute<T>(
  fn: () => T,
  fallback: T,
  context: string = 'Operation'
): T {
  try {
    return fn();
  } catch (e) {
    console.error(`${context} failed:`, e instanceof Error ? e.message : String(e));
    return fallback;
  }
}

/**
 * Log detailed error information
 * @param context Context where error occurred
 * @param error Error object
 * @param additionalInfo Additional information to log
 */
export function logError(
  context: string,
  error: unknown,
  additionalInfo?: Record<string, unknown>
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error(`[${context}] Error occurred:`, {
    message: errorMessage,
    stack: errorStack,
    timestamp: new Date().toISOString(),
    ...additionalInfo,
  });
}
