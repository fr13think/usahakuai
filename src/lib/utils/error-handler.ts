import { NextResponse } from 'next/server';

// Error types for resource optimization
export enum ResourceOptimizationErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  DATABASE_ERROR = 'DATABASE_ERROR',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
}

export interface ResourceOptimizationError {
  code: ResourceOptimizationErrorCode;
  message: string;
  details?: unknown;
  field?: string;
  suggestions?: string[];
}

// Error response format
export interface ErrorResponse {
  error: {
    code: ResourceOptimizationErrorCode;
    message: string;
    details?: unknown;
    field?: string;
    suggestions?: string[];
    timestamp: string;
  };
  success: false;
}

// Success response format
export interface SuccessResponse<T = unknown> {
  data?: T;
  message?: string;
  success: true;
  timestamp: string;
}

// Create standardized error responses
export function createErrorResponse(
  error: ResourceOptimizationError,
  status: number = 400
): NextResponse<ErrorResponse> {
  const response: ErrorResponse = {
    error: {
      ...error,
      timestamp: new Date().toISOString(),
    },
    success: false,
  };

  return NextResponse.json(response, { status });
}

// Create standardized success responses
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<SuccessResponse<T>> {
  const response: SuccessResponse<T> = {
    data,
    message,
    success: true,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}

// Handle common errors
export function handleDatabaseError(error: unknown): ResourceOptimizationError {
  console.error('Database error:', error);

  // Handle specific Supabase/PostgreSQL errors
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    
    // Table doesn't exist
    if (err.code === '42P01') {
      return {
        code: ResourceOptimizationErrorCode.DATABASE_ERROR,
        message: 'Required database table does not exist. Please contact support.',
        suggestions: ['Ensure database migrations have been run', 'Contact system administrator']
      };
    }
    
    // Unique constraint violation
    if (err.code === '23505') {
      return {
        code: ResourceOptimizationErrorCode.DUPLICATE_ENTRY,
        message: 'A record with this information already exists.',
        suggestions: ['Check for existing records', 'Use unique identifiers']
      };
    }
    
    // Foreign key constraint violation
    if (err.code === '23503') {
      return {
        code: ResourceOptimizationErrorCode.BUSINESS_RULE_VIOLATION,
        message: 'Referenced record does not exist.',
        suggestions: ['Ensure related records exist before creating this record']
      };
    }
    
    // Check constraint violation
    if (err.code === '23514') {
      return {
        code: ResourceOptimizationErrorCode.VALIDATION_ERROR,
        message: 'Data violates database constraints.',
        suggestions: ['Check data values are within allowed ranges']
      };
    }

    // Permission denied
    if (err.code === '42501') {
      return {
        code: ResourceOptimizationErrorCode.INSUFFICIENT_PERMISSIONS,
        message: 'Insufficient permissions to perform this operation.',
        suggestions: ['Contact administrator for access']
      };
    }
  }

  return {
    code: ResourceOptimizationErrorCode.DATABASE_ERROR,
    message: 'An unexpected database error occurred.',
    details: typeof error === 'object' ? JSON.stringify(error) : String(error)
  };
}

// Handle validation errors
export function handleValidationError(
  errors: string[],
  field?: string
): ResourceOptimizationError {
  return {
    code: ResourceOptimizationErrorCode.VALIDATION_ERROR,
    message: errors.length === 1 ? errors[0] : 'Multiple validation errors occurred.',
    field,
    details: errors.length > 1 ? errors : undefined,
    suggestions: [
      'Check all required fields are filled',
      'Ensure data formats are correct',
      'Verify numeric values are within allowed ranges'
    ]
  };
}

// Handle business rule violations
export function handleBusinessRuleError(
  message: string,
  warnings?: string[]
): ResourceOptimizationError {
  return {
    code: ResourceOptimizationErrorCode.BUSINESS_RULE_VIOLATION,
    message,
    details: warnings,
    suggestions: [
      'Review business rules and constraints',
      'Adjust data to meet business requirements',
      'Contact supervisor for guidance on exceptions'
    ]
  };
}

// Rate limiting error
export function handleRateLimitError(): ResourceOptimizationError {
  return {
    code: ResourceOptimizationErrorCode.RATE_LIMIT_EXCEEDED,
    message: 'Too many requests. Please try again later.',
    suggestions: [
      'Wait a few minutes before trying again',
      'Reduce the frequency of requests',
      'Contact support if this continues'
    ]
  };
}

// Unauthorized access error
export function handleUnauthorizedError(): ResourceOptimizationError {
  return {
    code: ResourceOptimizationErrorCode.UNAUTHORIZED,
    message: 'Authentication required or invalid credentials.',
    suggestions: [
      'Ensure you are logged in',
      'Refresh your session',
      'Contact support if login issues persist'
    ]
  };
}

// Not found error
export function handleNotFoundError(resource: string): ResourceOptimizationError {
  return {
    code: ResourceOptimizationErrorCode.NOT_FOUND,
    message: `${resource} not found or you don't have permission to access it.`,
    suggestions: [
      'Check the resource ID is correct',
      'Ensure the resource exists',
      'Verify you have permission to access this resource'
    ]
  };
}

// External API error
export function handleExternalApiError(service: string): ResourceOptimizationError {
  return {
    code: ResourceOptimizationErrorCode.EXTERNAL_API_ERROR,
    message: `External service (${service}) is currently unavailable.`,
    suggestions: [
      'Try again in a few minutes',
      'Check service status page',
      'Contact support if the issue persists'
    ]
  };
}

// Utility to safely parse error objects
export function safeParseError(error: unknown): {
  message: string;
  code?: string;
  details?: unknown;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack,
    };
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    return {
      message: typeof err.message === 'string' ? err.message : 'Unknown error',
      code: typeof err.code === 'string' ? err.code : undefined,
      details: err,
    };
  }

  return {
    message: String(error) || 'Unknown error occurred',
  };
}

// Error logging utility
export function logError(
  operation: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  const parsedError = safeParseError(error);
  
  console.error(`[ResourceOptimization][${operation}]`, {
    error: parsedError,
    context,
    timestamp: new Date().toISOString(),
  });
}

// Centralized error handler for API routes
export function withErrorHandler<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>,
  operation: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      logError(operation, error, { args });
      throw error;
    }
  };
}