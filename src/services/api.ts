/**
 * YouTube Summarizer API Service
 * ===============================
 * 
 * Comprehensive API client for the YouTube Summarizer backend.
 * Matches the optimized FastAPI backend structure with full type safety.
 * 
 * ## Processing Workflow
 * 
 * The backend uses a multi-tier fallback approach:
 * - **Tier 1**: yt-dlp captions extraction (fastest)
 * - **Tier 2**: Audio transcription via FAL API
 * - **Tier 3**: Gemini direct URL processing (fallback)
 * 
 * ## Available Endpoints
 * 
 * - `/api/health` - System health and configuration status
 * - `/api/validate-url` - YouTube URL validation
 * - `/api/video-info` - Video metadata extraction
 * - `/api/transcript` - Transcript extraction only
 * - `/api/summary` - Text summarization only
 * - `/api/process` - Complete processing pipeline
 * - `/api/generate` - **Master endpoint** (recommended for frontend)
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_VERSION = "2.0.0";

// Development logging
if (import.meta.env.DEV) {
  const displayUrl = API_BASE_URL || '/api (Vite proxy → localhost:8080)';
  console.log('🔗 API Base URL:', displayUrl);
  console.log('📊 API Version:', API_VERSION);
}

// ================================
// TYPE DEFINITIONS
// ================================
// These match the Pydantic models in the backend exactly

// Request Models
export interface YouTubeRequest {
  url: string;
}

export interface YouTubeProcessRequest {
  url: string;
  generate_summary?: boolean;
}

export interface TextSummaryRequest {
  text: string;
}

export interface GenerateRequest {
  url: string;
  include_transcript?: boolean;
  include_summary?: boolean;
  include_analysis?: boolean;
  include_metadata?: boolean;
}

// Response Models
export interface URLValidationResponse {
  is_valid: boolean;
  cleaned_url: string | null;
  original_url: string;
}

export interface VideoInfoResponse {
  title: string;
  author: string;
  duration?: string;
  duration_seconds?: number;
  thumbnail?: string;
  view_count?: number;
  upload_date?: string;
  url: string;
}

export interface TranscriptResponse {
  title: string;
  author: string;
  transcript: string;
  url: string;
  processing_time: string;
}

export interface SummaryResponse {
  title: string;
  summary: string;
  analysis?: AnalysisData;
  processing_time: string;
}

export interface ProcessingResponse {
  status: 'success' | 'error';
  message: string;
  data?: ProcessingResultData;
  logs: string[];
}

export interface GenerateResponse {
  status: 'success' | 'error';
  message: string;
  video_info?: VideoInfoResponse;
  transcript?: string;
  summary?: string;
  analysis?: AnalysisData;
  metadata: Record<string, unknown>;
  processing_details: Record<string, string>;
  logs: string[];
}

// Structured Data Models
export interface AnalysisData {
  title: string;
  overall_summary: string;
  chapters: AnalysisChapter[];
  key_facts: string[];
  takeaways: string[];
  chapter_count?: number;
  total_key_facts?: number;
  total_takeaways?: number;
}

export interface AnalysisChapter {
  header: string;
  summary: string;
  key_points: string[];
}

export interface ProcessingResultData {
  title: string;
  author: string;
  duration?: string;
  thumbnail?: string;
  view_count?: number;
  upload_date?: string;
  transcript: string;
  summary?: string;
  analysis?: AnalysisData;
  processing_method: string;
  processing_time: string;
  url: string;
  original_url: string;
}

// Health Check Response
export interface HealthCheckResponse {
  status: 'healthy';
  message: string;
  timestamp: string;
  version: string;
  environment: {
    gemini_configured: boolean;
    fal_configured: boolean;
  };
}

// Root API Info Response
export interface RootResponse {
  name: string;
  version: string;
  description: string;
  docs: string;
  health: string;
  endpoints: Record<string, string>;
  workflow: {
    tier_1: string;
    tier_2: string;
    tier_3: string;
  };
}

// Error Types
export interface ApiError {
  message: string;
  status?: number;
  details?: string;
  type?: 'network' | 'validation' | 'server' | 'processing' | 'unknown';
}

// Processing Status Indicators
export type ProcessingStatus = 'pending' | 'success' | 'failed';

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
    options: RequestInit = {}
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

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `HTTP ${response.status}: ${response.statusText}`,
          detail: response.statusText
        }));
        
        const apiError: ApiError = {
          message: errorData.detail || errorData.message || `Request failed with status ${response.status}`,
          status: response.status,
          type: this.categorizeError(response.status),
          details: JSON.stringify(errorData)
        };
        
        throw apiError;
      }

      return await response.json();
    } catch (error) {
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
   * Get API root information
   */
  async getApiInfo(): Promise<RootResponse> {
    return this.makeRequest('/');
  }

  /**
   * Health check with environment configuration
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    return this.makeRequest('/health');
  }

  /**
   * Validate YouTube URL
   */
  async validateUrl(url: string): Promise<URLValidationResponse> {
    return this.makeRequest('/validate-url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  /**
   * Extract video metadata only
   */
  async getVideoInfo(url: string): Promise<VideoInfoResponse> {
    return this.makeRequest('/video-info', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  /**
   * Extract transcript only
   */
  async getTranscript(url: string): Promise<TranscriptResponse> {
    return this.makeRequest('/transcript', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  /**
   * Generate summary from text
   */
  async generateSummary(text: string): Promise<SummaryResponse> {
    return this.makeRequest('/summary', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  /**
   * Complete video processing with options
   */
  async processVideo(request: YouTubeProcessRequest): Promise<ProcessingResponse> {
    return this.makeRequest('/process', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * 🌟 MASTER ENDPOINT - Comprehensive video analysis
   * 
   * This is the recommended endpoint for frontend applications.
   * Provides complete control over what data to include.
   */
  async generateComprehensiveAnalysis(request: GenerateRequest): Promise<GenerateResponse> {
    const body: GenerateRequest = {
      url: request.url,
      include_transcript: request.include_transcript ?? true,
      include_summary: request.include_summary ?? true,
      include_analysis: request.include_analysis ?? true,
      include_metadata: request.include_metadata ?? true,
    };

    return this.makeRequest('/generate', {
      method: 'POST',
      body: JSON.stringify(body),
    });
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

// Convenience functions with proper binding
export const getApiInfo = () => apiClient.getApiInfo();
export const healthCheck = () => apiClient.healthCheck();
export const validateUrl = (url: string) => apiClient.validateUrl(url);
export const getVideoInfo = (url: string) => apiClient.getVideoInfo(url);
export const getTranscript = (url: string) => apiClient.getTranscript(url);
export const generateSummary = (text: string) => apiClient.generateSummary(text);
export const processVideo = (request: YouTubeProcessRequest) => apiClient.processVideo(request);
export const generateComprehensiveAnalysis = (request: GenerateRequest) => apiClient.generateComprehensiveAnalysis(request);

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
  UNKNOWN: 'An unexpected error occurred'
} as const;

export const PROCESSING_STATUSES = {
  PENDING: 'pending',
  SUCCESS: 'success', 
  FAILED: 'failed'
} as const;

export const TIER_DESCRIPTIONS = {
  TIER_1: 'yt-dlp captions extraction',
  TIER_2: 'audio transcription via FAL',
  TIER_3: 'Gemini direct URL processing'
} as const;

// Export everything for convenient imports
export default apiClient;
