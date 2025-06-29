// Centralized Error Handler Utility
import { toast } from "@/hooks/use-toast";
import { ApiError, AuthError } from "@/config/api";

export interface ErrorDetails {
  message: string;
  code?: string;
  status?: number;
  retryable?: boolean;
  action?: () => void;
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ValidationError extends Error {
  constructor(message: string, public fields?: Record<string, string[]>) {
    super(message);
    this.name = "ValidationError";
  }
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}

// Error message mapping for user-friendly messages
const ERROR_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your input and try again.",
  401: "Your session has expired. Please log in again.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This action conflicts with existing data.",
  422: "Please check your input and try again.",
  429: "Too many requests. Please slow down and try again.",
  500: "Something went wrong on our servers. Please try again later.",
  502: "Service temporarily unavailable. Please try again.",
  503: "Service is under maintenance. Please try again later.",
  504: "Request timed out. Please try again.",
};

// Retry configuration
export interface RetryConfig {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  shouldRetry?: (error: any, attempt: number) => boolean;
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  delay: 1000,
  backoff: true,
  shouldRetry: (error: any) => {
    // Don't retry on client errors (4xx) except 429 (rate limit)
    if (error instanceof ApiError && error.status) {
      return error.status >= 500 || error.status === 429;
    }
    // Retry on network errors
    return error instanceof NetworkError || error.message.includes("network");
  },
};

// Main error handler function
export function handleError(error: any, context?: string): ErrorDetails {
  console.error(`Error${context ? ` in ${context}` : ""}:`, error);

  // Handle specific error types
  if (error instanceof AuthError) {
    return {
      message: "Authentication required. Please log in again.",
      code: "AUTH_ERROR",
      status: error.status,
      retryable: false,
    };
  }

  if (error instanceof ApiError) {
    const userMessage = ERROR_MESSAGES[error.status || 0] || error.message;
    return {
      message: userMessage,
      code: "API_ERROR",
      status: error.status,
      retryable: error.status ? error.status >= 500 || error.status === 429 : false,
    };
  }

  if (error instanceof ValidationError) {
    return {
      message: error.message,
      code: "VALIDATION_ERROR",
      retryable: false,
    };
  }

  if (error instanceof PermissionError) {
    return {
      message: error.message,
      code: "PERMISSION_ERROR",
      retryable: false,
    };
  }

  if (error instanceof NetworkError || error.message?.includes("Failed to fetch")) {
    return {
      message: "Network error. Please check your connection and try again.",
      code: "NETWORK_ERROR",
      retryable: true,
    };
  }

  // Handle timeout errors
  if (error.name === "AbortError" || error.message?.includes("timeout")) {
    return {
      message: "Request timed out. Please try again.",
      code: "TIMEOUT_ERROR",
      retryable: true,
    };
  }

  // Default error
  return {
    message: "An unexpected error occurred. Please try again.",
    code: "UNKNOWN_ERROR",
    retryable: true,
  };
}

// Show error notification
export function showErrorNotification(error: any, context?: string) {
  const errorDetails = handleError(error, context);
  
  toast({
    title: "Error",
    description: errorDetails.message,
    variant: "destructive",
    action: errorDetails.retryable && errorDetails.action
      ? {
          label: "Retry",
          onClick: errorDetails.action,
        }
      : undefined,
  });
}

// Retry utility function
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { maxAttempts, delay, backoff, shouldRetry } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts || !shouldRetry(error, attempt)) {
        throw error;
      }

      // Calculate delay with exponential backoff if enabled
      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
      
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

// Batch error handler for multiple operations
export async function batchWithErrorHandling<T>(
  operations: Array<() => Promise<T>>,
  options?: {
    stopOnError?: boolean;
    context?: string;
  }
): Promise<Array<{ success: boolean; data?: T; error?: any }>> {
  const results = [];
  
  for (const operation of operations) {
    try {
      const data = await operation();
      results.push({ success: true, data });
    } catch (error) {
      results.push({ success: false, error });
      
      if (options?.stopOnError) {
        if (options.context) {
          showErrorNotification(error, options.context);
        }
        break;
      }
    }
  }
  
  return results;
}

// Format validation errors for display
export function formatValidationErrors(errors: Record<string, string[]>): string {
  const messages = Object.entries(errors)
    .map(([field, fieldErrors]) => {
      const fieldName = field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      return `${fieldName}: ${fieldErrors.join(", ")}`;
    })
    .join("\n");
  
  return messages;
}

// Check if error is retryable
export function isRetryableError(error: any): boolean {
  const errorDetails = handleError(error);
  return errorDetails.retryable || false;
}

// Create error boundary error handler
export function createErrorBoundaryHandler(resetError: () => void) {
  return (error: Error, errorInfo: any) => {
    console.error("Error caught by boundary:", error, errorInfo);
    
    const errorDetails = handleError(error);
    
    toast({
      title: "Application Error",
      description: errorDetails.message,
      variant: "destructive",
      action: errorDetails.retryable
        ? {
            label: "Reload Page",
            onClick: () => window.location.reload(),
          }
        : undefined,
    });
  };
}