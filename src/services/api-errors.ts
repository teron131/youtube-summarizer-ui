import { ApiError } from './api-types';

export const ERROR_MESSAGES = {
  NETWORK: 'Unable to connect to the server. Please check your internet connection.',
  TIMEOUT: 'Request timeout. The server took too long to respond.',
  VALIDATION: 'Invalid request. Please check your input.',
  SERVER: 'Server error. Please try again later.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
  ABORTED: 'Request was cancelled.',
  PROCESSING: 'Error during video processing. Please try again.',
  INVALID_URL: 'Invalid YouTube URL. Please provide a valid YouTube video URL.',
  NO_TRANSCRIPT: 'No transcript available for this video.',
  API_KEY_MISSING: 'API configuration error. Please contact the administrator.',
  EMPTY_URL: 'URL is required',
  CONFIG_MISSING: 'Required API key missing',
  API_QUOTA_EXCEEDED: 'API quota exceeded'
} as const;

export function handleApiError(error: unknown): ApiError {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: ERROR_MESSAGES.NETWORK,
      type: 'network',
      details: error.message,
    };
  }

  // Abort errors
  if (error instanceof Error && error.name === 'AbortError') {
    return {
      message: ERROR_MESSAGES.ABORTED,
      type: 'network',
      details: 'Request was aborted',
    };
  }

  // Already formatted ApiError
  if (isApiError(error)) {
    return error;
  }

  // Generic Error object
  if (error instanceof Error) {
    return {
      message: error.message || ERROR_MESSAGES.UNKNOWN,
      type: 'unknown',
      details: error.stack,
    };
  }

  // Unknown error type
  return {
    message: ERROR_MESSAGES.UNKNOWN,
    type: 'unknown',
    details: String(error),
  };
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'message' in error;
}

export function isNetworkError(error: ApiError): boolean {
  return error.type === 'network' || 
         error.message.includes('network') || 
         error.message.includes('connection');
}

export function isValidationError(error: ApiError): boolean {
  return error.type === 'validation' || 
         (error.status !== undefined && error.status >= 400 && error.status < 500);
}

export function isProcessingError(error: ApiError): boolean {
  return error.type === 'processing' || 
         error.message.includes('processing') || 
         error.message.includes('transcript') ||
         error.message.includes('analysis');
}

export function isServerError(error: ApiError): boolean {
  return error.type === 'server' || 
         (error.status !== undefined && error.status >= 500);
}

export function getErrorMessage(error: ApiError): string {
  if (error.type === 'network') return ERROR_MESSAGES.NETWORK;
  if (error.type === 'validation') return ERROR_MESSAGES.VALIDATION;
  if (error.type === 'server') return ERROR_MESSAGES.SERVER;
  if (error.type === 'processing') return ERROR_MESSAGES.PROCESSING;
  
  if (error.message.includes('YouTube URL')) return ERROR_MESSAGES.INVALID_URL;
  if (error.message.includes('transcript')) return ERROR_MESSAGES.NO_TRANSCRIPT;
  if (error.message.includes('API key') || error.message.includes('API_KEY')) {
    return ERROR_MESSAGES.API_KEY_MISSING;
  }
  
  return error.message || ERROR_MESSAGES.UNKNOWN;
}

export function getErrorSeverity(error: ApiError): 'low' | 'medium' | 'high' {
  if (isNetworkError(error)) return 'medium';
  if (isValidationError(error)) return 'low';
  if (isServerError(error)) return 'high';
  if (isProcessingError(error)) return 'medium';
  return 'medium';
}

export function categorizeError(status: number): ApiError['type'] {
  if (status >= 400 && status < 500) return 'validation';
  if (status >= 500) return 'server';
  return 'unknown';
}

