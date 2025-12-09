/**
 * YouTube API Client
 * Main API client for interacting with the YouTube Summarizer backend
 */

import type {
    ConfigurationResponse,
    HealthCheckResponse,
    ScrapRequest,
    ScrapResponse,
    StreamingProcessingResult,
    StreamingProgressState,
    SummarizeRequest,
    SummarizeResponse,
    VideoInfoResponse
} from './api-types';

import { handleApiError as handleApiErrorUtil } from './api-errors';
import { makeRequest } from './api-request';
import { processStreamingChunks, streamSummarizeContent } from './api-streaming';
import * as apiUtils from './api-utils';
import {
    AVAILABLE_MODELS_LIST,
    DEFAULT_ANALYSIS_MODEL,
    DEFAULT_QUALITY_MODEL,
    DEFAULT_TARGET_LANGUAGE,
    SUPPORTED_LANGUAGES_LIST
} from './config';

const API_VERSION = "3.0.0";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

if (import.meta.env.DEV) {
  const displayUrl = API_BASE_URL || '/api (Vite proxy → localhost:8080)';
  console.log('API Base URL:', displayUrl);
  console.log('API Version:', API_VERSION);
}

/**
 * YouTube API Client class
 * Provides methods for interacting with the YouTube Summarizer backend
 */
export class YouTubeApiClient {
  private version: string;
  private requestCache = new Map<string, Promise<unknown>>();

  constructor(version: string = API_VERSION) {
    this.version = version;
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    return makeRequest('/health', {}, this.version);
  }

  /**
   * Get available models and languages configuration
   */
  async getConfiguration(): Promise<ConfigurationResponse> {
    return makeRequest('/config', {}, this.version);
  }

  /**
   * Get configuration with fallback to local config
   */
  async getConfigurationWithFallback(): Promise<ConfigurationResponse> {
    try {
      return await this.getConfiguration();
    } catch (error) {
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
   * Scrap video info and transcript
   */
  async scrapVideo(request: ScrapRequest): Promise<ScrapResponse> {
    return makeRequest('/scrap', {
      method: 'POST',
      body: JSON.stringify(request),
      timeout: 120000 // 2 minutes
    }, this.version);
  }

  /**
   * Generate AI analysis
   */
  async summarizeContent(request: SummarizeRequest): Promise<SummarizeResponse> {
    return makeRequest('/summarize', {
      method: 'POST',
      body: JSON.stringify(request),
      timeout: 300000 // 5 minutes
    }, this.version);
  }

  /**
   * Complete streaming processing workflow
   * Performs scraping and AI analysis with real-time progress updates
   */
  async streamingProcessing(
    url: string,
    onProgress?: (state: StreamingProgressState) => void,
    onLogUpdate?: (logs: string[]) => void,
    options?: {
      analysisModel?: string;
      qualityModel?: string;
      targetLanguage?: string;
    }
  ): Promise<StreamingProcessingResult> {
    const startTime = Date.now();
    let videoInfo: VideoInfoResponse | undefined;
    let transcript: string | undefined;
    let currentPhase: 'scraping' | 'analyzing' = 'scraping';
    const streamingLogs: string[] = [];

    try {
      // Step 1: Scrap video info and transcript
      onProgress?.({
        step: 'scraping',
        stepName: 'Scraping Video',
        status: 'processing',
        message: 'Extracting video info and transcript...'
      });

      const scrapResponse = await this.scrapVideo({ url });

      if (!scrapResponse || scrapResponse.status === 'error') {
        throw new Error(scrapResponse?.message || 'Scraping failed');
      }

      // Convert flat response to VideoInfoResponse format
      videoInfo = {
        url: scrapResponse.url || undefined,
        title: scrapResponse.title || undefined,
        thumbnail: scrapResponse.thumbnail || undefined,
        author: scrapResponse.author || undefined,
        duration: scrapResponse.duration || undefined,
        upload_date: scrapResponse.upload_date || undefined,
        view_count: scrapResponse.view_count || undefined,
        like_count: scrapResponse.like_count || undefined,
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
        message: 'Generating AI summary and analysis...'
      });
      currentPhase = 'analyzing';

      // Convert "auto" to null for backend compatibility
      const targetLanguage = options?.targetLanguage === "auto" ? null : options?.targetLanguage;

      // Prepare content for analysis
      const hasTranscript = transcript && transcript.trim() !== '';
      const content = hasTranscript ? transcript : url;
      const contentType = hasTranscript ? 'transcript' : 'url';

      const stream = await streamSummarizeContent({
        content: content,
        content_type: contentType,
        analysis_model: options?.analysisModel || 'google/gemini-2.5-pro',
        quality_model: options?.qualityModel || 'google/gemini-2.5-flash',
        target_language: targetLanguage,
      });

      // Process streaming chunks
      const streamResult = await processStreamingChunks(stream, onProgress, onLogUpdate);

      return {
        success: true,
        videoInfo,
        transcript,
        analysis: streamResult.analysis,
        quality: streamResult.quality,
        totalTime: streamResult.totalTime,
        iterationCount: streamResult.iterationCount,
        chunksProcessed: streamResult.chunksProcessed,
        logs: streamResult.logs
      };

    } catch (error) {
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
      const apiError = handleApiErrorUtil(error);

      streamingLogs.push(`[${new Date().toLocaleTimeString()}] ❌ Error: ${apiError.message}`);
      streamingLogs.push(`[${new Date().toLocaleTimeString()}] Total time: ${totalTime}`);

      onProgress?.({
        step: currentPhase,
        stepName: currentPhase === 'scraping' ? 'Scraping Video' : 'Processing',
        status: 'error',
        message: apiError.message,
        error: apiError
      });

      onLogUpdate?.([...streamingLogs]);

      return {
        success: false,
        error: apiError,
        totalTime,
        iterationCount: 0,
        chunksProcessed: 0,
        logs: streamingLogs
      };
    }
  }

  /**
   * Utility: Validate YouTube URL
   */
  isValidYouTubeUrl(url: string): boolean {
    return apiUtils.isValidYouTubeUrl(url);
  }

  /**
   * Utility: Extract video ID from URL
   */
  extractVideoId(url: string): string {
    return apiUtils.extractVideoId(url);
  }

  /**
   * Utility: Get thumbnail URL
   */
  getThumbnailUrl(videoId: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'): string {
    return apiUtils.getThumbnailUrl(videoId, quality);
  }

  /**
   * Utility: Format processing time
   */
  formatProcessingTime(timeStr: string): string {
    return apiUtils.formatProcessingTime(timeStr);
  }

  /**
   * Utility: Format view count
   */
  formatViewCount(count: number): string {
    return apiUtils.formatViewCount(count);
  }

  /**
   * Utility: Format duration
   */
  formatDuration(durationStr: string): string {
    return apiUtils.formatDuration(durationStr);
  }

  /**
   * Clear request cache
   */
  clearCache(): void {
    this.requestCache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.requestCache.size;
  }
}

