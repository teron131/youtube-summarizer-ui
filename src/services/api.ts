/**
 * YouTube Summarizer API Service
 * ===============================
 * 
 * Optimized API client for the YouTube Summarizer backend.
 * Aligned with youtube-summarizer/app.py v3.0.0 implementation.
 * 
 * ## Processing Workflow
 * 
 * The backend uses a simplified 2-step approach:
 * - **Step 1**: `/scrap` - Extract video info and transcript using Apify
 * - **Step 2**: `/summarize` or `/stream-summarize` - Generate AI analysis using Gemini
 * 
 * ## Available Endpoints
 * 
 * - `/` - API information and health check
 * - `/health` - Health check with environment configuration
 * - `/scrap` - Extract video metadata and transcript
 * - `/summarize` - Full LangGraph workflow analysis
 * - `/stream-summarize` - Streaming analysis with real-time progress
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_VERSION = "3.0.0";

// Development logging
if (import.meta.env.DEV) {
  const displayUrl = API_BASE_URL || '/api (Vite proxy → localhost:8080)';
  console.log('🔗 API Base URL:', displayUrl);
  console.log('📊 API Version:', API_VERSION);
}

// ================================
// TYPE DEFINITIONS
// ================================

// Basic Video Info
export interface VideoInfoResponse {
  title: string;
  author: string;
  duration?: string;
  thumbnail?: string;
  view_count?: number;
  like_count?: number;
  upload_date?: string;
  url: string;
}

// 2-Step Processing Types
export interface ScrapRequest {
  url: string;
}

export interface ScrapResponse {
  status: string;
  message: string;
  timestamp: string;
  url: string;
  title: string;
  author: string;
  transcript: string;
  duration?: string;
  thumbnail?: string;
  view_count?: number;
  processing_time: string;
}

export interface SummarizeRequest {
  content: string;
  content_type?: 'url' | 'transcript';
}

export interface SummarizeResponse {
  status: string;
  message: string;
  timestamp: string;
  analysis: AnalysisData;
  processing_time: string;
}

export interface TwoStepProgressState {
  step: 1 | 2;
  stepName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message: string;
  data?: unknown;
  error?: ApiError;
  processingTime?: string;
}

export interface TwoStepProcessingResult {
  success: boolean;
  videoInfo?: VideoInfoResponse;
  transcript?: string;
  analysis?: AnalysisData;
  error?: ApiError;
  totalTime: string;
}

// Analysis Data Structure (matches backend Analysis model)
export interface AnalysisData {
  title: string;
  summary: string;
  takeaways: string[];
  key_facts: string[];
  chapters: AnalysisChapter[];
  keywords: string[];
}

export interface AnalysisChapter {
  header: string;
  summary: string;
  key_points: string[];
}

// Streaming Analysis Types
export interface StreamingChunk {
  // WorkflowState fields from backend
  transcript_or_url?: string;
  analysis?: AnalysisData;
  quality?: QualityData;
  iteration_count?: number;
  is_complete?: boolean;

  // Additional streaming metadata
  type?: 'status' | 'analysis' | 'quality' | 'complete' | 'error';
  message?: string;
  timestamp: string;
  chunk_number?: number;
  processing_time?: string;
  total_chunks?: number;
}

export interface QualityData {
  completeness: QualityRate;
  structure: QualityRate;
  grammar: QualityRate;
  timestamp: QualityRate;
  no_garbage: QualityRate;
  language: QualityRate;
  total_score: number;
  max_possible_score: number;
  percentage_score: number;
  is_acceptable: boolean;
}

export interface QualityRate {
  rate: 'Fail' | 'Refine' | 'Pass';
  reason: string;
}

export interface StreamingProgressState {
  step: 'scraping' | 'analyzing' | 'quality_check' | 'refinement' | 'complete';
  stepName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message: string;
  data?: unknown;
  error?: ApiError;
  processingTime?: string;
  iterationCount?: number;
  qualityScore?: number;
  chunkCount?: number;
}

export interface StreamingProcessingResult {
  success: boolean;
  videoInfo?: VideoInfoResponse;
  transcript?: string;
  analysis?: AnalysisData;
  quality?: QualityData;
  error?: ApiError;
  totalTime: string;
  iterationCount: number;
  chunksProcessed: number;
  logs: string[];
}

// Health Check Response
export interface HealthCheckResponse {
  status: 'healthy';
  message: string;
  timestamp: string;
  version: string;
  environment: {
    gemini_configured: boolean;
    apify_configured: boolean;
  };
}

// Error Types
export interface ApiError {
  message: string;
  status?: number;
  details?: string;
  type?: 'network' | 'validation' | 'server' | 'processing' | 'unknown';
}

// ================================
// API CLIENT CLASS
// ================================

class YouTubeApiClient {
  private baseUrl: string;
  private version: string;

  constructor(baseUrl: string = API_BASE_URL, version: string = API_VERSION) {
    // If no base URL is provided (development mode), use '/api' for Vite proxy
    this.baseUrl = baseUrl || '/api';
    this.version = version;
  }

  /**
   * Generic request handler with comprehensive error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout: number = 60000 // Default 60 seconds
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `YouTube-Summarizer-Frontend/${this.version}`,
        ...options.headers,
      },
      ...options,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, defaultOptions);
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `HTTP ${response.status}: ${response.statusText}`,
          detail: response.statusText
        }));
        
        // Debug logging
        console.log('🔍 Error Response Debug:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          endpoint
        });
        
        // Handle nested error structures from backend
        let errorMessage = `Request failed with status ${response.status}`;
        
        if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (typeof errorData.detail === 'object' && errorData.detail.error) {
            errorMessage = errorData.detail.error;
          } else if (typeof errorData.detail === 'object' && errorData.detail.message) {
            errorMessage = errorData.detail.message;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        // Map backend error messages to frontend constants
        if (errorMessage.includes('Invalid YouTube URL')) {
          errorMessage = ERROR_MESSAGES.INVALID_URL;
        } else if (errorMessage.includes('URL is required')) {
          errorMessage = ERROR_MESSAGES.EMPTY_URL;
        } else if (errorMessage.includes('Required API key missing')) {
          errorMessage = ERROR_MESSAGES.CONFIG_MISSING;
        } else if (errorMessage.includes('quota')) {
          errorMessage = ERROR_MESSAGES.API_QUOTA_EXCEEDED;
        }
        
        console.log('🔍 Extracted Error Message:', errorMessage);
        
        const apiError: ApiError = {
          message: errorMessage,
          status: response.status,
          type: this.categorizeError(response.status),
          details: JSON.stringify(errorData)
        };
        
        throw apiError;
      }

      return await response.json();
          } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof Error && error.name === 'AbortError') {
          const timeoutError: ApiError = {
            message: `Request timed out after ${timeout / 1000} seconds. The operation may still be processing on the server.`,
            type: 'processing',
            details: `Timeout set to ${timeout}ms for endpoint: ${endpoint}`
          };
          throw timeoutError;
        }
        
        if ((error as ApiError).type) {
          // Already processed as ApiError
          throw error;
        }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError: ApiError = {
          message: 'Unable to connect to the YouTube Summarizer backend. Please ensure the server is running.',
          type: 'network',
          details: error.message
        };
        throw networkError;
      }
      
      // Unknown error
      const unknownError: ApiError = {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        type: 'unknown',
        details: error instanceof Error ? error.stack : String(error)
      };
      throw unknownError;
    }
  }

  /**
   * Categorize errors based on HTTP status codes
   */
  private categorizeError(status: number): ApiError['type'] {
    if (status >= 400 && status < 500) return 'validation';
    if (status >= 500) return 'server';
    if (status === 413) return 'processing'; // Payload too large
    return 'unknown';
  }

  // ================================
  // API ENDPOINTS
  // ================================

  /**
   * Health check with environment configuration
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    return this.makeRequest('/health');
  }

  /**
   * Scrap video info and transcript using Apify
   */
  async scrapVideo(request: ScrapRequest): Promise<ScrapResponse> {
    return this.makeRequest('/scrap', {
      method: 'POST',
      body: JSON.stringify(request),
    }, 120000); // 2 minutes for scraping
  }

  /**
   * Generate AI analysis using Gemini
   */
  async summarizeContent(request: SummarizeRequest): Promise<SummarizeResponse> {
    return this.makeRequest('/summarize', {
      method: 'POST',
      body: JSON.stringify(request),
    }, 300000); // 5 minutes for AI analysis (matches backend timeout)
  }

  /**
   * Stream AI analysis with real-time progress updates
   */
  async streamSummarizeContent(request: SummarizeRequest): Promise<ReadableStream<Uint8Array>> {
    const url = `${this.baseUrl}/stream-summarize`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `YouTube-Summarizer-Frontend/${this.version}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
        detail: response.statusText
      }));

      const apiError: ApiError = {
        message: `Request failed with status ${response.status}`,
        status: response.status,
        type: this.categorizeError(response.status),
        details: JSON.stringify(errorData)
      };
      throw apiError;
    }

    return response.body!;
  }

  // ================================
  // TWO-STEP PROCESSING WORKFLOW
  // ================================

  /**
   * Complete two-step processing using /api/scrap and /api/summarize
   */
  async twoStepProcessing(
    url: string,
    onProgress?: (state: TwoStepProgressState) => void
  ): Promise<TwoStepProcessingResult> {
    const startTime = Date.now();
    let videoInfo: VideoInfoResponse | undefined;
    let transcript: string | undefined;
    let analysis: AnalysisData | undefined;

    try {
      // Step 1: Scrap video info and transcript
      onProgress?.({
        step: 1,
        stepName: 'Scraping Video',
        status: 'processing',
        message: 'Extracting video info and transcript using Apify...'
      });

      const scrapResponse = await this.scrapVideo({ url });
      
      if (scrapResponse.status === 'error') {
        throw new Error(scrapResponse.message);
      }

      // Convert flat response to VideoInfoResponse format
      videoInfo = {
        title: scrapResponse.title,
        author: scrapResponse.author,
        duration: scrapResponse.duration,
        thumbnail: scrapResponse.thumbnail,
        view_count: scrapResponse.view_count,
        url: scrapResponse.url
      };
      transcript = scrapResponse.transcript;

      onProgress?.({
        step: 1,
        stepName: 'Scraping Video',
        status: 'completed',
        message: `Video scraped: ${videoInfo.title}`,
        data: { videoInfo, transcript },
        processingTime: scrapResponse.processing_time
      });

      // Step 2: Generate AI analysis
      onProgress?.({
        step: 2,
        stepName: 'AI Analysis',
        status: 'processing',
        message: 'Generating AI summary and analysis using Gemini...'
      });

      const summarizeResponse = await this.summarizeContent({
        content: transcript,
        content_type: 'transcript'
      });

      if (summarizeResponse.status === 'error') {
        throw new Error(summarizeResponse.message);
      }

      analysis = summarizeResponse.analysis;

      onProgress?.({
        step: 2,
        stepName: 'AI Analysis',
        status: 'completed',
        message: 'Analysis completed successfully',
        data: { analysis },
        processingTime: summarizeResponse.processing_time
      });

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

      return {
        success: true,
        videoInfo,
        transcript,
        analysis,
        totalTime
      };

    } catch (error) {
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
      const apiError = handleApiError(error);

      onProgress?.({
        step: 1,
        stepName: 'Processing',
        status: 'error',
        message: apiError.message,
        error: apiError
      });

      return {
        success: false,
        error: apiError,
        totalTime
      };
    }
  }

  // ================================
  // STREAMING PROCESSING WORKFLOW
  // ================================

  /**
   * Complete streaming processing using /scrap and /stream-summarize
   * Logs streaming data internally but provides simple progress updates
   */
  async streamingProcessing(
    url: string,
    onProgress?: (state: StreamingProgressState) => void,
    onLogUpdate?: (logs: string[]) => void
  ): Promise<StreamingProcessingResult> {
    const startTime = Date.now();
    let videoInfo: VideoInfoResponse | undefined;
    let transcript: string | undefined;
    let analysis: AnalysisData | undefined;
    let quality: QualityData | undefined;
    let iterationCount = 0;
    let chunksProcessed = 0;
    const streamingLogs: string[] = [];
    let finalWorkflowState: StreamingChunk | null = null;

    try {
      // Step 1: Scrap video info and transcript
      onProgress?.({
        step: 'scraping',
        stepName: 'Scraping Video',
        status: 'processing',
        message: 'Extracting video info and transcript using Apify...'
      });

      const scrapResponse = await this.scrapVideo({ url });

      if (scrapResponse.status === 'error') {
        throw new Error(scrapResponse.message);
      }

      // Convert flat response to VideoInfoResponse format
      videoInfo = {
        title: scrapResponse.title,
        author: scrapResponse.author,
        duration: scrapResponse.duration,
        thumbnail: scrapResponse.thumbnail,
        view_count: scrapResponse.view_count,
        url: scrapResponse.url
      };
      transcript = scrapResponse.transcript;

      onProgress?.({
        step: 'scraping',
        stepName: 'Scraping Video',
        status: 'completed',
        message: `Video scraped: ${videoInfo.title}`,
        data: { videoInfo, transcript },
        processingTime: scrapResponse.processing_time
      });

      // Step 2: Stream AI analysis
      onProgress?.({
        step: 'analyzing',
        stepName: 'AI Analysis',
        status: 'processing',
        message: 'Generating AI summary and analysis using Gemini...'
      });

      const stream = await this.streamSummarizeContent({
        content: transcript,
        content_type: 'transcript'
      });

      const reader = stream.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6)) as StreamingChunk;
                chunksProcessed++;

                // Store the complete workflow state for final results
                finalWorkflowState = data;

                // Extract data from the workflow state
                if (data.analysis) {
                  analysis = data.analysis;
                }
                if (data.quality) {
                  quality = data.quality;
                }
                if (data.iteration_count) {
                  iterationCount = data.iteration_count;
                }

                // Generate user-friendly log messages
                const timestamp = new Date(data.timestamp).toLocaleTimeString();
                let logMessage = '';

                if (data.is_complete && data.analysis && data.quality) {
                  // Final completion message
                  const qualityScore = data.quality.percentage_score || 0;
                  const chaptersCount = data.analysis.chapters?.length || 0;
                  logMessage = `✅ Analysis completed successfully! Generated ${chaptersCount} chapters with ${qualityScore}% quality score`;
                } else if (data.quality && data.iteration_count !== undefined) {
                  // Quality check results
                  const qualityScore = data.quality.percentage_score || 0;
                  const isAcceptable = data.quality.is_acceptable;
                  
                  if (isAcceptable) {
                    logMessage = `🎯 Quality check passed with ${qualityScore}% score - Analysis meets requirements`;
                  } else {
                    logMessage = `🔄 Quality check: ${qualityScore}% score (needs improvement) - Refining analysis (iteration ${data.iteration_count})`;
                  }
                } else if (data.analysis && data.iteration_count !== undefined) {
                  // Analysis generation
                  const chaptersCount = data.analysis.chapters?.length || 0;
                  logMessage = `📝 Generated analysis with ${chaptersCount} chapters (iteration ${data.iteration_count})`;
                } else if (data.iteration_count === 0) {
                  // Initial processing
                  logMessage = `🚀 Starting AI analysis with Gemini...`;
                } else if (data.iteration_count !== undefined && data.iteration_count > 0) {
                  // Refinement iterations
                  logMessage = `🔧 Refining analysis for better quality (iteration ${data.iteration_count})`;
                } else {
                  // Fallback for unknown states
                  logMessage = `⚙️ Processing analysis...`;
                }

                const logEntry = `[${timestamp}] ${logMessage}`;
                streamingLogs.push(logEntry);

                // Only emit basic progress updates
                if (data.is_complete) {
                  onProgress?.({
                    step: 'complete',
                    stepName: 'Analysis Complete',
                    status: 'completed',
                    message: `Analysis completed successfully with ${data.quality?.percentage_score || 0}% quality score`,
                    iterationCount: data.iteration_count
                  });
                } else if (chunksProcessed % 2 === 0) { // Update every other chunk to avoid spam
                  const currentPhase = data.quality ? 'quality check' : 'analysis generation';
                  onProgress?.({
                    step: 'analyzing',
                    stepName: 'AI Analysis',
                    status: 'processing',
                    message: `Processing ${currentPhase}... (iteration ${data.iteration_count})`,
                    iterationCount: data.iteration_count
                  });
                }

                // Update logs callback
                onLogUpdate?.([...streamingLogs]);
              } catch (parseError) {
                console.warn('Failed to parse streaming chunk:', line, parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

      // Log final workflow state with user-friendly messages
      if (finalWorkflowState) {
        const timestamp = new Date().toLocaleTimeString();
        streamingLogs.push(`[${timestamp}] 🏁 Workflow completed successfully in ${totalTime}`);
        streamingLogs.push(`[${timestamp}] 📊 Summary: ${iterationCount} iterations processed`);
        
        if (analysis?.chapters?.length) {
          streamingLogs.push(`[${timestamp}] 📚 Generated ${analysis.chapters.length} video chapters`);
        }
        
        if (quality) {
          const qualityEmoji = quality.percentage_score >= 80 ? '🌟' : quality.percentage_score >= 60 ? '⭐' : '🔄';
          streamingLogs.push(`[${timestamp}] ${qualityEmoji} Final quality score: ${quality.percentage_score}%`);
        }
      }

      return {
        success: true,
        videoInfo,
        transcript,
        analysis,
        quality,
        totalTime,
        iterationCount,
        chunksProcessed,
        logs: streamingLogs
      };

    } catch (error) {
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
      const apiError = handleApiError(error);

      // Add error to logs
      const errorTimestamp = new Date().toLocaleTimeString();
      streamingLogs.push(`[${errorTimestamp}] ❌ Error occurred: ${apiError.message}`);
      streamingLogs.push(`[${errorTimestamp}] ⏱️ Total processing time: ${totalTime}`);

      onProgress?.({
        step: 'analyzing',
        stepName: 'Processing',
        status: 'error',
        message: apiError.message,
        error: apiError
      });

      return {
        success: false,
        error: apiError,
        totalTime,
        iterationCount,
        chunksProcessed,
        logs: streamingLogs
      };
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Client-side YouTube URL validation
   */
  isValidYouTubeUrl(url: string): boolean {
    const patterns = [
      /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/v\/[a-zA-Z0-9_-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/shorts\/[a-zA-Z0-9_-]+/,
    ];
    
    return patterns.some(pattern => pattern.test(url));
  }

  /**
   * Extract video ID from YouTube URL
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  /**
   * Generate YouTube thumbnail URL
   */
  getThumbnailUrl(videoId: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'): string {
    const qualityMap = {
      'default': 'default',
      'hq': 'hqdefault',
      'mq': 'mqdefault', 
      'sd': 'sddefault',
      'maxres': 'maxresdefault'
    };
    
    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
  }

  /**
   * Format processing time
   */
  formatProcessingTime(timeStr: string): string {
    const seconds = parseFloat(timeStr.replace('s', ''));
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  }

  /**
   * Format view count
   */
  formatViewCount(count: number): string {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  }

  /**
   * Format duration
   */
  formatDuration(durationStr: string): string {
    const seconds = parseInt(durationStr.replace('s', ''));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

// ================================
// SINGLETON INSTANCE & EXPORTS
// ================================

// Create singleton instance
export const apiClient = new YouTubeApiClient();

// Main processing function
export const twoStepProcessing = (
  url: string,
  onProgress?: (state: TwoStepProgressState) => void
) => apiClient.twoStepProcessing(url, onProgress);

// Streaming processing function (recommended)
export const streamingProcessing = (
  url: string,
  onProgress?: (state: StreamingProgressState) => void,
  onLogUpdate?: (logs: string[]) => void
) => apiClient.streamingProcessing(url, onProgress, onLogUpdate);

// Individual endpoint functions
export const healthCheck = () => apiClient.healthCheck();
export const scrapVideo = (request: ScrapRequest) => apiClient.scrapVideo(request);
export const summarizeContent = (request: SummarizeRequest) => apiClient.summarizeContent(request);

// Utility functions
export const isValidYouTubeUrl = (url: string) => apiClient.isValidYouTubeUrl(url);
export const extractVideoId = (url: string) => apiClient.extractVideoId(url);
export const getThumbnailUrl = (videoId: string, quality?: 'default' | 'hq' | 'mq' | 'sd' | 'maxres') => apiClient.getThumbnailUrl(videoId, quality);
export const formatProcessingTime = (timeStr: string) => apiClient.formatProcessingTime(timeStr);
export const formatViewCount = (count: number) => apiClient.formatViewCount(count);
export const formatDuration = (durationStr: string) => apiClient.formatDuration(durationStr);

// ================================
// ERROR HANDLING UTILITIES
// ================================

export const handleApiError = (error: unknown): ApiError => {
  if (isApiError(error)) {
    return error;
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      type: 'unknown',
      details: error.stack,
    };
  }
  
  return {
    message: 'An unknown error occurred',
    type: 'unknown',
    details: String(error),
  };
};

export const isApiError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'message' in error;
};

export const isNetworkError = (error: ApiError): boolean => {
  return error.type === 'network' || 
         error.message.includes('Unable to connect') ||
         error.message.includes('fetch');
};

export const isValidationError = (error: ApiError): boolean => {
  return error.type === 'validation' ||
         error.status === 400 || 
         error.message.includes('validation') ||
         error.message.includes('invalid');
};

export const isProcessingError = (error: ApiError): boolean => {
  return error.type === 'processing' ||
         error.status === 413 ||
         error.message.includes('too long') ||
         error.message.includes('processing failed');
};

export const isServerError = (error: ApiError): boolean => {
  return error.type === 'server' ||
         (error.status !== undefined && error.status >= 500);
};

export const getErrorMessage = (error: ApiError): string => {
  if (isNetworkError(error)) {
    return 'Connection failed. Please check if the backend server is running.';
  }
  
  if (isValidationError(error)) {
    return error.message;
  }
  
  if (isProcessingError(error)) {
    return 'Video processing failed. The video might be too long or unavailable.';
  }
  
  if (isServerError(error)) {
    return 'Server error occurred. Please try again later.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

export const getErrorSeverity = (error: ApiError): 'low' | 'medium' | 'high' => {
  if (isNetworkError(error) || isServerError(error)) return 'high';
  if (isProcessingError(error)) return 'medium';
  return 'low';
};

// ================================
// CONSTANTS
// ================================

export const ERROR_MESSAGES = {
  NETWORK: 'Unable to connect to the server',
  VALIDATION: 'Invalid input provided', 
  PROCESSING: 'Video processing failed',
  SERVER: 'Server error occurred',
  UNKNOWN: 'An unexpected error occurred',
  INVALID_URL: 'Invalid YouTube URL',
  EMPTY_URL: 'URL is required',
  CONFIG_MISSING: 'Required API key missing',
  API_QUOTA_EXCEEDED: 'API quota exceeded'
} as const;

// Export everything for convenient imports
export default apiClient;
