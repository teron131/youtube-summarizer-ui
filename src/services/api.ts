/**
 * YouTube Summarizer API Service
 * Handles all communication with the backend FastAPI server
 */

// For local dev, Vite proxy will handle this. For production, it's set at build time.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Log the API base URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL || 'Using Vite proxy (localhost:8080)');
}

// Types
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

export interface AnalysisData {
  title: string;
  overall_summary: string;
  chapters: {
    header: string;
    summary: string;
    key_points: string[];
  }[];
  key_facts: string[];
  takeaways: string[];
}

export interface GenerateRequest {
  url: string;
  include_transcript?: boolean;
  include_summary?: boolean;
  include_analysis?: boolean;
  include_metadata?: boolean;
}

export interface GenerateResponse {
  status: 'success' | 'error';
  message: string;
  video_info?: VideoInfoResponse;
  transcript?: string;
  summary?: string;
  analysis?: AnalysisData;
  metadata?: Record<string, unknown>;
  processing_details?: Record<string, string>;
  logs?: string[];
}

/**
 * @deprecated This interface is deprecated and will be removed in a future version.
 * Please use GenerateResponse instead.
 */
export interface ProcessingResultData {
  title: string;
  author: string;
  duration?: string;
  thumbnail?: string;
  view_count?: number;
  upload_date?: string;
  transcript: string;
  summary?: string;
  processing_time: string;
  url: string;
}

/**
 * @deprecated This interface is deprecated and will be removed in a future version.
 * Please use GenerateResponse instead.
 */
export interface ProcessingResponse {
  status: 'success' | 'error';
  message: string;
  data?: ProcessingResultData;
  logs: string[];
}

export interface ApiError {
  message: string;
  status?: number;
  details?: string;
}

// API Client Class
class YouTubeApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `HTTP ${response.status}: ${response.statusText}` 
        }));
        
        throw new Error(errorData.detail || errorData.message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Updated error message for clarity
        throw new Error(`Unable to connect to the server. Please ensure the backend is running and reachable.`);
      }
      throw error;
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
    return this.makeRequest('/api/health');
  }

  /**
   * New master endpoint for comprehensive analysis.
   */
  async generateComprehensiveAnalysis(
    request: GenerateRequest
  ): Promise<GenerateResponse> {
    const body = {
      ...request,
      // Ensure booleans are sent correctly
      include_transcript: request.include_transcript ?? true,
      include_summary: request.include_summary ?? true,
      include_analysis: request.include_analysis ?? true,
      include_metadata: request.include_metadata ?? true,
    };
    return this.makeRequest('/api/generate', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * @deprecated This method is deprecated and will be removed in a future version.
   * Use generateComprehensiveAnalysis for a more comprehensive workflow.
   */
  async getVideoInfo(url: string): Promise<VideoInfoResponse> {
    console.warn("`getVideoInfo` is deprecated. Use `generateComprehensiveAnalysis` instead.");
    return this.makeRequest('/api/video-info', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  /**
   * @deprecated This method is deprecated and will be removed in a future version.
   * Use generateComprehensiveAnalysis for a more comprehensive workflow.
   */
  async processVideo(
    url: string,
    generateSummary: boolean = true
  ): Promise<ProcessingResponse> {
    console.warn("`processVideo` is deprecated. Use `generateComprehensiveAnalysis` instead.");
    return this.makeRequest('/api/process', {
      method: 'POST',
      body: JSON.stringify({
        url, 
        generate_summary: generateSummary 
      }),
    });
  }

  /**
   * Validate YouTube URL format
   */
  isValidYouTubeUrl(url: string): boolean {
    const patterns = [
      /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/v\/[a-zA-Z0-9_-]+/,
    ];
    
    return patterns.some(pattern => pattern.test(url));
  }

  /**
   * Extract video ID from YouTube URL
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }
}

// Create singleton instance
export const apiClient = new YouTubeApiClient();

// Convenience functions - properly bound to maintain context
export const healthCheck = () => apiClient.healthCheck();
export const generateComprehensiveAnalysis = (request: GenerateRequest) =>
  apiClient.generateComprehensiveAnalysis(request);

/** @deprecated */
export const getVideoInfo = (url: string): Promise<VideoInfoResponse> => apiClient.getVideoInfo(url);
/** @deprecated */
export const processVideo = (url: string, generateSummary: boolean = true) =>
  apiClient.processVideo(url, generateSummary);
export const isValidYouTubeUrl = (url: string) => apiClient.isValidYouTubeUrl(url);
export const extractVideoId = (url: string) => apiClient.extractVideoId(url);

// Error handling utilities
export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack,
    };
  }
  
  return {
    message: 'An unknown error occurred',
    details: String(error),
  };
};

export const isNetworkError = (error: ApiError): boolean => {
  return error.message.includes('Unable to connect to server') ||
         error.message.includes('fetch');
};

export const isValidationError = (error: ApiError): boolean => {
  return error.status === 400 || 
         error.message.includes('validation') ||
         error.message.includes('invalid');
};