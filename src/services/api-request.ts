/**
 * HTTP request utilities for API communication
 */

import { ERROR_MESSAGES } from './api-errors';
import type { ApiError } from './api-types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface RequestOptions extends RequestInit {
  timeout?: number;
}

/**
 * Make an HTTP request with error handling and timeout
 */
export async function makeRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
  version: string = '3.0.0'
): Promise<T> {
  const { timeout = 60000, ...fetchOptions } = options;
  const url = `${API_BASE_URL || '/api'}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': `YouTube-Summarizer-Frontend/${version}`,
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...defaultOptions, signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw await handleErrorResponse(response, timeout, url);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw handleRequestError(error, timeout, url);
  }
}

/**
 * Handle error response from server
 */
async function handleErrorResponse(response: Response, timeout: number, url: string): Promise<ApiError> {
  const errorData = await response.json().catch(() => ({
    message: `HTTP ${response.status}: ${response.statusText}`,
    detail: response.statusText
  }));

  let errorMessage = `Request failed with status ${response.status}`;

  // Extract error message from various backend formats
  if (errorData.detail) {
    if (typeof errorData.detail === 'string') {
      errorMessage = errorData.detail;
    } else if (typeof errorData.detail === 'object') {
      errorMessage = errorData.detail.error || errorData.detail.message || errorMessage;
    }
  } else if (errorData.message) {
    errorMessage = errorData.message;
  } else if (errorData.error) {
    errorMessage = errorData.error;
  }

  // Map backend error messages to frontend constants
  errorMessage = normalizeErrorMessage(errorMessage);

  return {
    message: errorMessage,
    status: response.status,
    type: categorizeError(response.status),
    details: JSON.stringify(errorData)
  };
}

/**
 * Handle request errors (timeout, network, etc.)
 */
function handleRequestError(error: unknown, timeout: number, url: string): ApiError {
  if (error instanceof Error && error.name === 'AbortError') {
    return {
      message: `Request timed out after ${timeout / 1000} seconds. The operation may still be processing on the server.`,
      type: 'processing',
      details: `Timeout set to ${timeout}ms for endpoint: ${url}`
    };
  }

  if ((error as ApiError).type) {
    // Already processed as ApiError
    return error as ApiError;
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: 'Unable to connect to the YouTube Summarizer backend. Please ensure the server is running.',
      type: 'network',
      details: error.message
    };
  }

  // Unknown error
  return {
    message: error instanceof Error ? error.message : 'An unknown error occurred',
    type: 'unknown',
    details: error instanceof Error ? error.stack : String(error)
  };
}

/**
 * Normalize error messages to use frontend constants
 */
function normalizeErrorMessage(message: string): string {
  if (message.includes('Invalid YouTube URL')) return ERROR_MESSAGES.INVALID_URL;
  if (message.includes('URL is required')) return ERROR_MESSAGES.EMPTY_URL;
  if (message.includes('Required API key missing')) return ERROR_MESSAGES.CONFIG_MISSING;
  if (message.includes('quota')) return ERROR_MESSAGES.API_QUOTA_EXCEEDED;
  return message;
}

/**
 * Categorize errors based on HTTP status codes
 */
function categorizeError(status: number): ApiError['type'] {
  if (status >= 400 && status < 500) return 'validation';
  if (status >= 500) return 'server';
  if (status === 413) return 'processing';
  return 'unknown';
}

