/**
 * YouTube Summarizer API Service
 * ===============================
 *
 * Optimized API client for the YouTube Summarizer backend.
 * Aligned with youtube-summarizer/app.py v3.0.0 implementation.
 *
 * ## Key Features
 *
 * - **Meta-language avoidance**: Clean, direct AI responses without meta-descriptive language
 * - **Advanced LangGraph workflow**: Multi-step analysis with quality control and self-refinement
 * - **Real-time streaming**: Progress updates during processing
 * - **Multi-model support**: Gemini, Claude, and GPT models
 * - **Translation support**: Multiple language options
 *
 * ## URL Configuration
 *
 * **Development**: Uses Vite proxy `/api` → `localhost:8080`
 * **Production**: Set `VITE_API_BASE_URL=https://youtube-summarizer-teron131.up.railway.app` (no `/api` suffix)
 *
 * ## Processing Workflow
 *
 * The backend uses an advanced LangGraph workflow with multiple processing options:
 * - **Step 1**: `/scrap` - Extract video info and transcript using Apify
 * - **Step 2**: `/summarize` or `/stream-summarize` - Generate AI analysis with:
 *   - Model selection (Gemini 2.5 Pro/Flash, Claude Sonnet 4)
 *   - Translation support (Chinese, English, Japanese, Korean, German, Russian)
 *   - Quality assessment with automatic refinement
 *   - Meta-language avoidance for cleaner output
 *   - Real-time streaming progress updates
 *
 * ## Available Endpoints
 *
 * - `/` - API information and health check
 * - `/health` - Health check with environment configuration
 * - `/config` - Get available models and languages for configuration
 * - `/scrap` - Extract video metadata and transcript
 * - `/summarize` - Full LangGraph workflow analysis
 * - `/stream-summarize` - Streaming analysis with real-time progress
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_VERSION = "3.0.0";

// Import configuration constants
import {
  AVAILABLE_MODELS_LIST,
  DEFAULT_ANALYSIS_MODEL,
  DEFAULT_QUALITY_MODEL,
  DEFAULT_TARGET_LANGUAGE,
  SUPPORTED_LANGUAGES_LIST
} from './config';

// Development logging
if (import.meta.env.DEV) {
  const displayUrl = API_BASE_URL || '/api (Vite proxy → localhost:8080)';
  console.log('API Base URL:', displayUrl);
  console.log('API Version:', API_VERSION);
} else {
  // Production logging
  console.log('Production API Base URL:', API_BASE_URL || 'Not configured');
  console.log('API Version:', API_VERSION);
}

// ================================
// TYPE DEFINITIONS
// ================================

// Basic Video Info
export interface VideoInfoResponse {
  url: string;
  title: string;
  thumbnail?: string;
  author: string;
  duration?: string;
  upload_date?: string;
  view_count?: number;
  like_count?: number;
}

export interface ScrapRequest {
  url: string; // min_length=10, max_length=2048
}

export interface ScrapResponse {
  status: string;
  message: string;
  timestamp: string;
  transcript: string;
  processing_time: string;

  // Video data in consistent order
  url: string;
  title: string;
  thumbnail?: string;
  author: string;
  duration?: string;
  upload_date?: string;
  view_count?: number;
  like_count?: number;
}

export interface SummarizeRequest {
  content: string; // min_length=10, max_length=50000
  content_type?: 'url' | 'transcript'; // pattern=r"^(url|transcript)$"

  // Model selection
  analysis_model?: string; // default="google/gemini-2.5-pro"
  quality_model?: string; // default="google/gemini-2.5-flash"

  // Translation options
  target_language?: string | null; // Target language for translation (None for auto-detect, "auto" gets converted to null)


}

// SummarizeResponse with new metadata fields
export interface SummarizeResponse {
  status: string;
  message: string;
  timestamp: string;
  analysis: AnalysisData;
  quality?: QualityData;
  processing_time: string;
  iteration_count: number; // default=1

  // Model metadata
  analysis_model: string; // Model used for analysis
  quality_model: string; // Model used for quality evaluation

  // Translation metadata
  target_language?: string | null; // Target language used for translation

}

// Configuration Response
export interface ConfigurationResponse {
  status: string;
  message: string;
  available_models: Record<string, string>; // Available models for selection
  supported_languages: Record<string, string>; // Supported languages for translation
  default_analysis_model: string; // Default analysis model
  default_quality_model: string; // Default quality model
  default_target_language: string; // Default target language
}

// ================================
// ANALYSIS DATA STRUCTURES
// ================================
// Updated to match backend Python models (v3.0.0):
// - TextItem provides clean text content
// - text field replaces point field (clearer semantics)
// - Keywords in Analysis model for better extraction context
// - All interfaces aligned with Pydantic models in summarizer.py

// Using simple strings for takeaways and key facts

// Main analysis result (matches backend Analysis model)
export interface AnalysisData {
  title: string;
  summary: string;
  takeaways: string[];                 // Key insights as simple strings
  key_facts: string[];                 // Important facts as simple strings
  chapters: AnalysisChapter[];         // Video chapter breakdown
  keywords: string[];                  // Extracted keywords (max 3)
  target_language?: string | null;     // Translation target language
}

// Video chapter structure (matches backend Chapter model)
export interface AnalysisChapter {
  header: string;
  summary: string;
  key_points: string[];               // Chapter-specific key points
}

// ================================
// STREAMING ANALYSIS TYPES
// ================================

// Real-time streaming chunk from LangGraph workflow (matches backend GraphState)
export interface StreamingChunk {
  // Core workflow state (matches backend GraphState fields)
  transcript_or_url?: string;        // Input content or YouTube URL
  analysis?: AnalysisData;           // Current analysis result
  quality?: QualityData;             // Current quality assessment
  iteration_count?: number;          // Current iteration number
  is_complete?: boolean;             // Whether workflow is finished

  // Streaming metadata (added by backend API)
  timestamp?: string;                // Chunk timestamp
  chunk_number?: number;             // Sequential chunk number
  type?: 'status' | 'analysis' | 'quality' | 'complete' | 'error';
  message?: string;                  // Human-readable status message
  processing_time?: string;          // Current processing time
  total_chunks?: number;             // Total chunks expected
}

// ================================
// QUALITY ASSESSMENT STRUCTURES
// ================================

// Quality assessment for analysis (matches backend Quality model)
export interface QualityData {
  completeness: QualityRate;         // Coverage of entire transcript
  structure: QualityRate;            // Organization and formatting
  grammar: QualityRate;              // Language quality and correctness
  no_garbage: QualityRate;           // Removal of promotional content
  meta_language_avoidance: QualityRate; // Avoidance of meta-language phrases
  useful_keywords: QualityRate;      // Usefulness of keywords for analysis highlighting
  correct_language: QualityRate;     // Language consistency and quality

  // Computed quality metrics (optional - calculated by backend)
  total_score?: number;               // Raw score out of max possible
  max_possible_score?: number;        // Maximum possible score
  percentage_score?: number;          // Quality percentage (0-100)
  is_acceptable?: boolean;           // Whether quality meets threshold
}

// Individual quality rating (matches backend Rate model)
export interface QualityRate {
  rate: 'Fail' | 'Refine' | 'Pass';  // Quality level assessment
  reason: string;                   // Explanation for the rating
}

export interface StreamingProgressState {
  step: 'scraping' | 'analyzing' | 'analysis_generation' | 'quality_check' | 'refinement' | 'complete';
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
  private requestCache = new Map<string, Promise<unknown>>();
  private abortController: AbortController | null = null;

  constructor(baseUrl: string = API_BASE_URL, version: string = API_VERSION) {
    // Development: Use '/api' for Vite proxy → localhost:8080
    // Production: Use full Railway URL (e.g., https://youtube-summarizer-teron131.up.railway.app)
    this.baseUrl = baseUrl || '/api';
    this.version = version;
  }

  /**
   * Optimized request handler with connection pooling and smart retry
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout: number = 60000 // Default 60 seconds
  ): Promise<T> {
    // Create request key for deduplication
    const requestKey = `${endpoint}-${JSON.stringify(options)}`;

    // Return cached request if identical is in progress
    if (this.requestCache.has(requestKey)) {
      return this.requestCache.get(requestKey)! as Promise<T>;
    }

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

    // Create and cache the request promise
    const requestPromise = this._executeRequest<T>(url, { ...defaultOptions, signal: controller.signal }, timeoutId, timeout);
    this.requestCache.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up cache after request completes
      this.requestCache.delete(requestKey);
    }
  }

  /**
   * Clear request cache (useful for cleanup)
   */
  public clearCache(): void {
    this.requestCache.clear();
  }

  /**
   * Get cache size for debugging
   */
  public getCacheSize(): number {
    return this.requestCache.size;
  }

  private async _executeRequest<T>(
    url: string,
    options: RequestInit,
    timeoutId: NodeJS.Timeout,
    timeout: number
  ): Promise<T> {
    try {
      const response = await fetch(url, options);
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `HTTP ${response.status}: ${response.statusText}`,
          detail: response.statusText
        }));
        
        
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
          details: `Timeout set to ${timeout}ms for endpoint: ${url}`
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

  // Health check endpoint (optional for tooling)
  async healthCheck(): Promise<HealthCheckResponse> {
    return this.makeRequest('/health');
  }

  /**
   * Get available models and languages configuration
   */
  async getConfiguration(): Promise<ConfigurationResponse> {
    return this.makeRequest('/config');
  }

  /**
   * Get configuration with fallback to local config
   */
  async getConfigurationWithFallback(): Promise<ConfigurationResponse> {
    try {
      return await this.getConfiguration();
    } catch (error) {
      // Fallback to local configuration if backend is unavailable
      console.warn('Backend configuration unavailable, using local fallback:', error);
      return {
        status: 'success',
        message: 'Using local configuration fallback',
        available_models: AVAILABLE_MODELS_LIST.reduce((acc, model) => ({
          ...acc,
          [model.key]: model.label
        }), {}),
        supported_languages: SUPPORTED_LANGUAGES_LIST.reduce((acc, lang) => ({
          ...acc,
          [lang.key]: lang.label
        }), {}),
        default_analysis_model: DEFAULT_ANALYSIS_MODEL,
        default_quality_model: DEFAULT_QUALITY_MODEL,
        default_target_language: DEFAULT_TARGET_LANGUAGE,
      };
    }
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
  ): Promise<never> {
    const startTime = Date.now();
    let videoInfo: VideoInfoResponse | undefined;
    let transcript: string | undefined;
    let analysis: AnalysisData | undefined;

    throw {
      message: 'Deprecated: Use streamingProcessing(url) instead.',
      type: 'validation',
    } as ApiError as never;
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
    onLogUpdate?: (logs: string[]) => void,
    options?: {
      analysisModel?: string;
      qualityModel?: string;
      targetLanguage?: string; // "auto" gets converted to null for backend
    }
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
    let currentPhase: 'scraping' | 'analyzing' = 'scraping';

    // Phase timers for per-step durations
    const phaseStartTimes: {
      analysisStart?: number;
      qualityStart?: number;
      refinementStart?: number;
    } = {};
    let refinementInProgress = false;
    const msToSecondsString = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

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
        url: scrapResponse.url,
        title: scrapResponse.title,
        thumbnail: scrapResponse.thumbnail,
        author: scrapResponse.author,
        duration: scrapResponse.duration,
        upload_date: scrapResponse.upload_date,
        view_count: scrapResponse.view_count,
        like_count: scrapResponse.like_count,
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
      currentPhase = 'analyzing';

      // Convert "auto" to null for backend compatibility
      const targetLanguage = options?.targetLanguage === "auto" ? null : options?.targetLanguage;

      const stream = await this.streamSummarizeContent({
        content: transcript,
        content_type: 'transcript',
        analysis_model: options?.analysisModel || 'google/gemini-2.5-pro',
        quality_model: options?.qualityModel || 'google/gemini-2.5-flash',
        target_language: targetLanguage,
      });

      // Log analysis start and set timer
      phaseStartTimes.analysisStart = Date.now();
      {
        const timestamp = new Date().toLocaleTimeString();
        streamingLogs.push(`[${timestamp}] 🚀 Starting AI analysis with ${options?.analysisModel || 'google/gemini-2.5-pro'} model...`);
        onLogUpdate?.([...streamingLogs]);
      }

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
                const jsonData = line.slice(6);

                // Skip empty or malformed data lines
                if (!jsonData.trim() || jsonData.trim() === '{}') {
                  continue;
                }


                // Try to parse the JSON chunk
                const data = JSON.parse(jsonData) as StreamingChunk;
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
                if (data.iteration_count !== undefined) {
                  iterationCount = data.iteration_count;
                }

                // Generate user-friendly log messages with detailed workflow steps
                const timestamp = new Date(data.timestamp || Date.now()).toLocaleTimeString();
                let logMessage = '';

                // Convert to 1-based iteration count for display
                const displayIteration = (data.iteration_count ?? 0) + 1;


                if (data.is_complete && data.analysis && data.quality) {
                  // Final completion message - handle missing percentage_score
                  const qualityScore = typeof data.quality.percentage_score === 'number' ? data.quality.percentage_score : undefined;
                  const chaptersCount = data.analysis.chapters?.length || 0;
                  logMessage = qualityScore !== undefined
                    ? `✅ Analysis completed successfully! Generated ${chaptersCount} chapters with ${qualityScore}% quality score`
                    : `✅ Analysis completed successfully! Generated ${chaptersCount} chapters`;
                } else if (data.quality && data.iteration_count !== undefined) {
                  // Quality check results - handle missing computed properties
                  const qualityScore = typeof data.quality.percentage_score === 'number' ? data.quality.percentage_score : undefined;
                  const isAcceptable = data.quality.is_acceptable ?? (typeof qualityScore === 'number' ? qualityScore >= 90 : false);

                  if (isAcceptable) {
                    logMessage = qualityScore !== undefined
                      ? `🎯 Quality check passed with ${qualityScore}% score - Analysis meets requirements`
                      : `🎯 Quality check passed - Analysis meets requirements`;
                  } else {
                    logMessage = qualityScore !== undefined
                      ? `🔄 Quality check: ${qualityScore}% score (needs improvement) - Starting refinement (iteration ${displayIteration})`
                      : `🔄 Quality check: needs improvement - Starting refinement (iteration ${displayIteration})`;
                  }
                } else if (data.analysis && data.iteration_count !== undefined && data.iteration_count === 1 && !data.quality) {
                  // Initial analysis generation (iteration 1 in backend)
                  const chaptersCount = data.analysis.chapters?.length || 0;
                  const duration = phaseStartTimes.analysisStart ? msToSecondsString(Date.now() - phaseStartTimes.analysisStart) : undefined;
                  logMessage = duration ? `📝 Initial analysis generated with ${chaptersCount} chapters (${duration})` : `📝 Initial analysis generated with ${chaptersCount} chapters`;
                } else if (data.analysis && data.iteration_count !== undefined && data.iteration_count > 1 && !data.quality) {
                  // Analysis refinement
                  const chaptersCount = data.analysis.chapters?.length || 0;
                  logMessage = `🔧 Analysis refined with ${chaptersCount} chapters (iteration ${displayIteration})`;
                } else {
                  // Only show processing message once per chunk to avoid spam
                  if (chunksProcessed % 5 === 1) { // Show every 5th chunk
                    logMessage = `⚡ Processing analysis...`;
                  } else {
                    logMessage = ''; // Skip logging for other chunks
                  }
                }

                // Only add log entry if message is not empty
                if (logMessage) {
                  const logEntry = `[${timestamp}] ${logMessage}`;
                  streamingLogs.push(logEntry);
                }

                // Emit detailed progress updates based on workflow state
                if (data.is_complete) {
                  onProgress?.({
                    step: 'complete',
                    stepName: 'Analysis Complete',
                    status: 'completed',
                    message: typeof data.quality?.percentage_score === 'number'
                      ? `✅ Analysis completed successfully with ${data.quality?.percentage_score}% quality score`
                      : '✅ Analysis completed successfully',
                    iterationCount: displayIteration,
                    qualityScore: typeof data.quality?.percentage_score === 'number' ? data.quality?.percentage_score : undefined,
                    chunkCount: chunksProcessed,
                    processingTime: msToSecondsString(Date.now() - startTime)
                  });

                  // Ensure we also emit a quality_check completion if the only quality data arrives on the final chunk
                  if (data.quality) {
                    const qualityScore = typeof data.quality.percentage_score === 'number' ? data.quality.percentage_score : undefined;
                    const qcDuration = phaseStartTimes.qualityStart ? msToSecondsString(Date.now() - phaseStartTimes.qualityStart) : undefined;

                    onProgress?.({
                      step: 'quality_check',
                      stepName: 'Quality Assessment',
                      status: 'completed',
                      message: qualityScore !== undefined ? `🎯 Quality check passed (${qualityScore}%)` : '🎯 Quality check completed',
                      iterationCount: displayIteration,
                      qualityScore,
                      processingTime: qcDuration
                    });
                  }
                } else if (data.quality && data.iteration_count !== undefined) {
                  // Quality check phase
                  const qualityScore = typeof data.quality.percentage_score === 'number' ? data.quality.percentage_score : undefined;
                  const isAcceptable = data.quality.is_acceptable ?? (typeof qualityScore === 'number' ? qualityScore >= 90 : false);

                  // If a refinement was running, close it now
                  if (refinementInProgress) {
                    const refineDuration = phaseStartTimes.refinementStart ? msToSecondsString(Date.now() - phaseStartTimes.refinementStart) : undefined;
                    onProgress?.({
                      step: 'refinement',
                      stepName: 'Analysis Refinement',
                      status: 'completed',
                      message: `🔧 Refinement complete (iteration ${displayIteration})`,
                      iterationCount: displayIteration,
                      chunkCount: chunksProcessed,
                      processingTime: refineDuration
                    });
                    refinementInProgress = false;
                    phaseStartTimes.refinementStart = undefined;
                  }

                  const qcDuration = phaseStartTimes.qualityStart ? msToSecondsString(Date.now() - phaseStartTimes.qualityStart) : undefined;

                  onProgress?.({
                    step: 'quality_check',
                    stepName: 'Quality Assessment',
                    status: 'completed',
                    message: isAcceptable ?
                      (typeof qualityScore === 'number' ? `🎯 Quality check passed (${qualityScore}%)` : '🎯 Quality check passed') :
                      (typeof qualityScore === 'number' ? `🔄 Quality check: ${qualityScore}% - Starting refinement` : '🔄 Quality check: needs refinement - Starting refinement'),
                    iterationCount: displayIteration,
                    qualityScore: qualityScore,
                    processingTime: qcDuration
                  });

                  // If not acceptable, next phase is refinement
                  if (!isAcceptable) {
                    phaseStartTimes.refinementStart = Date.now();
                    refinementInProgress = true;
                  }
                } else if (data.analysis && data.iteration_count !== undefined && data.iteration_count > 1 && !data.quality) {
                  // Refinement phase
                  if (!refinementInProgress) {
                    phaseStartTimes.refinementStart = Date.now();
                    refinementInProgress = true;
                  }
                  onProgress?.({
                    step: 'refinement',
                    stepName: 'Analysis Refinement',
                    status: 'processing',
                    message: `🔧 Refining analysis (iteration ${displayIteration})`,
                    iterationCount: displayIteration,
                    chunkCount: chunksProcessed
                  });
                } else if (data.analysis && data.iteration_count === 1 && !data.quality) {
                  // Initial analysis generation
                  const duration = phaseStartTimes.analysisStart ? msToSecondsString(Date.now() - phaseStartTimes.analysisStart) : undefined;
                  onProgress?.({
                    step: 'analysis_generation',
                    stepName: 'Analysis Generation',
                    status: 'completed',
                    message: '📝 Initial analysis generated',
                    iterationCount: displayIteration,
                    processingTime: duration
                  });
                  // Start timing for first quality check
                  phaseStartTimes.qualityStart = Date.now();
                  // Emit a processing state for quality check so UI shows spinner even if quality arrives only at the end
                  onProgress?.({
                    step: 'quality_check',
                    stepName: 'Quality Assessment',
                    status: 'processing',
                    message: 'Evaluating analysis quality and completeness',
                    iterationCount: displayIteration
                  });
                } else if (chunksProcessed % 3 === 1) { // Update every 3rd chunk to avoid spam
                  onProgress?.({
                    step: 'analyzing',
                    stepName: 'AI Processing',
                    status: 'processing',
                    message: `⚡ Processing analysis... (iteration ${displayIteration})`,
                    iterationCount: displayIteration,
                    chunkCount: chunksProcessed
                  });
                }

                // Update logs callback
                onLogUpdate?.([...streamingLogs]);
                            } catch (parseError) {
                // Optimized error handling for malformed chunks with early detection
                const errorDetails = parseError instanceof Error ? parseError.message : String(parseError);

                // Early detection patterns for better performance
                const isCompleteChunk = line.includes('"type": "complete"') || line.includes('"is_complete": true');
                const isLargeChunk = line.length > 10000;
                const hasTranscript = line.includes('"transcript_or_url"');

                // Handle completion chunks that might be malformed (highest priority)
                if (isCompleteChunk) {
                  console.log('Detected completion chunk despite parse error');
                  const timestamp = new Date().toLocaleTimeString();
                  streamingLogs.push(`[${timestamp}] Analysis completed (completion detected)`);

                  onProgress?.({
                    step: 'complete',
                    stepName: 'Analysis Complete',
                    status: 'completed',
                    message: 'Analysis completed successfully'
                  });
                  continue;
                }

                // Limit logging for large chunks to reduce console spam
                if (isLargeChunk && chunksProcessed % 10 !== 0) {
                  return; // Skip logging every chunk to reduce overhead
                }


                if (isLargeChunk && hasTranscript) {
                  // Optimized extraction for large transcript chunks
                  const timestamp = new Date().toLocaleTimeString();

                  // Use more efficient regex patterns
                  const iterationMatch = line.match(/"iteration_count":\s*(\d+)/);
                  const qualityMatch = line.match(/"percentage_score":\s*(\d+(?:\.\d+)?)/);

                  if (iterationMatch) {
                    const extractedIteration = parseInt(iterationMatch[1], 10);
                    iterationCount = Math.max(iterationCount, extractedIteration);

                    if (qualityMatch) {
                      streamingLogs.push(`[${timestamp}] Quality score: ${qualityMatch[1]}% (iteration ${extractedIteration})`);
                    } else {
                      streamingLogs.push(`[${timestamp}] Processing analysis (iteration ${extractedIteration})`);
                    }
                  } else {
                    streamingLogs.push(`[${timestamp}] Large data chunk processed`);
                  }
                } else {
                  // Standard malformed chunk handling with reduced logging
                  const timestamp = new Date().toLocaleTimeString();
                  streamingLogs.push(`[${timestamp}] Malformed chunk skipped`);
                }

                // Update logs callback even for errors
                onLogUpdate?.([...streamingLogs]);
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
        streamingLogs.push(`[${timestamp}] Summary: ${iterationCount} iterations processed`);
        
        if (analysis?.chapters?.length) {
          streamingLogs.push(`[${timestamp}] 📚 Generated ${analysis.chapters.length} video chapters`);
        }
        
        if (quality) {
          // Prefer percentage_score; if missing, derive from total/max
          let finalQualityScore: number | undefined =
            typeof quality.percentage_score === 'number' ? quality.percentage_score : undefined;

          const totalScore: number | undefined = typeof quality.total_score === 'number' ? quality.total_score : undefined;
          const maxPossible: number | undefined = typeof quality.max_possible_score === 'number' ? quality.max_possible_score : undefined;
          if (finalQualityScore === undefined && totalScore !== undefined && maxPossible && maxPossible > 0) {
            finalQualityScore = Math.round((totalScore / maxPossible) * 100);
          }

        if (finalQualityScore !== undefined) {
            const qualityEmoji = finalQualityScore >= 80 ? '🌟' : finalQualityScore >= 60 ? '⭐' : '🔄';
            streamingLogs.push(`[${timestamp}] ${qualityEmoji} Final quality score: ${finalQualityScore}%`);
          }
        }

        // Emit final logs to UI
        onLogUpdate?.([...streamingLogs]);
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
      streamingLogs.push(`[${errorTimestamp}] Total processing time: ${totalTime}`);

      onProgress?.({
        step: currentPhase === 'scraping' ? 'scraping' : 'analyzing',
        stepName: currentPhase === 'scraping' ? 'Scraping Video' : 'Processing',
        status: 'error',
        message: apiError.message,
        error: apiError
      });

      // Surface logs in UI on error
      onLogUpdate?.([...streamingLogs]);

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
      /^https?:\/\/(www\.)?youtube\.com\/v\/[a-zA-Z0-9_-]+/,
    ];
    
    return patterns.some(pattern => pattern.test(url));
  }

  /**
   * Extract video ID from YouTube URL
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/v\/)([a-zA-Z0-9_-]+)/,
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
const apiClient = new YouTubeApiClient();

// Main processing function
// Deprecated export kept for compatibility: will throw if called
export const twoStepProcessing = (
  url: string,
) => apiClient.twoStepProcessing(url);

// Streaming processing function (recommended)
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

// Individual endpoint functions
export const healthCheck = () => apiClient.healthCheck();
export const getConfiguration = () => apiClient.getConfiguration();
export const getConfigurationWithFallback = () => apiClient.getConfigurationWithFallback();
export const scrapVideo = (request: ScrapRequest) => apiClient.scrapVideo(request);
// Not used by UI (streaming is used), but kept for tooling/testing
export const summarizeContent = (request: SummarizeRequest) => apiClient.summarizeContent(request);

// Utility functions
export const isValidYouTubeUrl = (url: string) => apiClient.isValidYouTubeUrl(url);
export const extractVideoId = (url: string) => apiClient.extractVideoId(url);
export const getThumbnailUrl = (videoId: string, quality?: 'default' | 'hq' | 'mq' | 'sd' | 'maxres') => apiClient.getThumbnailUrl(videoId, quality);
export const formatProcessingTime = (timeStr: string) => apiClient.formatProcessingTime(timeStr);
export const formatViewCount = (count: number) => apiClient.formatViewCount(count);
export const formatDuration = (durationStr: string) => apiClient.formatDuration(durationStr);

// ================================
// CONFIGURATION EXPORTS
// ================================

// Re-export configuration from config.ts for convenience
export {
  AVAILABLE_MODELS, AVAILABLE_MODELS_LIST, DEFAULT_ANALYSIS_MODEL,
  DEFAULT_QUALITY_MODEL,
  DEFAULT_TARGET_LANGUAGE, getLanguageByKey, getModelByKey, isValidLanguage, isValidModel, SUPPORTED_LANGUAGES, SUPPORTED_LANGUAGES_LIST, validateLanguageSelection, validateModelSelection, type AvailableModel, type LanguageKey, type ModelKey, type SupportedLanguage
} from './config';

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
export { apiClient };
export default apiClient;
