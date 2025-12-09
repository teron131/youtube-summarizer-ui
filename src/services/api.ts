/**
 * YouTube Summarizer API Service
 * ===============================
 *
 * Main entry point for the YouTube Summarizer API client.
 * Re-exports all API functionality from specialized modules.
 */

// ================================
// TYPE EXPORTS
// ================================

export type {
  AnalysisChapter,
  AnalysisData,
  ApiError,
  ConfigurationResponse,
  HealthCheckResponse,
  QualityData,
  QualityRate,
  ScrapRequest,
  ScrapResponse,
  StreamingChunk,
  StreamingProcessingResult,
  StreamingProgressState,
  SummarizeRequest,
  SummarizeResponse,
  VideoInfoResponse
} from './api-types';

// ================================
// ERROR HANDLING EXPORTS
// ================================

export {
  categorizeError, ERROR_MESSAGES,
  getErrorMessage,
  getErrorSeverity,
  handleApiError,
  isApiError,
  isNetworkError,
  isProcessingError,
  isServerError,
  isValidationError
} from './api-errors';

// ================================
// UTILITY EXPORTS
// ================================

export {
  extractVideoId,
  formatDuration,
  formatProcessingTime,
  formatViewCount,
  getThumbnailUrl,
  isValidYouTubeUrl
} from './api-utils';

// ================================
// API CLIENT
// ================================

import { YouTubeApiClient } from './api-client';
import type { StreamingProgressState } from './api-types';

// Create singleton instance
const apiClient = new YouTubeApiClient();

// ================================
// PUBLIC API FUNCTIONS
// ================================

/**
 * Health check
 */
export const healthCheck = () => apiClient.healthCheck();

/**
 * Get backend configuration
 */
export const getConfiguration = () => apiClient.getConfiguration();

/**
 * Get configuration with local fallback
 */
export const getConfigurationWithFallback = () => apiClient.getConfigurationWithFallback();

/**
 * Scrap video information and transcript
 */
export const scrapVideo = (request: { url: string }) => apiClient.scrapVideo(request);

/**
 * Generate AI analysis (non-streaming)
 */
export const summarizeContent = (request: {
  content: string;
  content_type: 'url' | 'transcript';
  analysis_model?: string;
  quality_model?: string;
  target_language?: string | null;
}) => apiClient.summarizeContent(request);

/**
 * Streaming processing function (recommended)
 * Performs complete workflow: scraping + AI analysis with progress updates
 */
export const streamingProcessing = (
  url: string,
  onProgress?: (state: StreamingProgressState) => void,
  onLogUpdate?: (logs: string[]) => void,
  options?: {
    analysisModel?: string;
    qualityModel?: string;
    targetLanguage?: string;
  }
) => apiClient.streamingProcessing(url, onProgress, onLogUpdate, options);

// ================================
// CONFIGURATION EXPORTS
// ================================

export {
  AVAILABLE_MODELS,
  AVAILABLE_MODELS_LIST,
  DEFAULT_ANALYSIS_MODEL,
  DEFAULT_QUALITY_MODEL,
  DEFAULT_TARGET_LANGUAGE,
  getLanguageByKey,
  getModelByKey,
  isValidLanguage,
  isValidModel,
  SUPPORTED_LANGUAGES,
  SUPPORTED_LANGUAGES_LIST,
  validateLanguageSelection,
  validateModelSelection,
  type AvailableModel,
  type LanguageKey,
  type ModelKey,
  type SupportedLanguage
} from './config';

// ================================
// EXPORTS
// ================================

export { apiClient, YouTubeApiClient };
export default apiClient;
