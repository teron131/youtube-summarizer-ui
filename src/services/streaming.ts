/**
 * Streaming Service
 * Handles Server-Sent Events (SSE) for real-time analysis
 */

import { api } from './api';
import {
  AnalysisData,
  ApiError,
  QualityData,
  StreamingChunk,
  StreamingProcessingResult,
  StreamingProgressState,
  SummarizeRequest,
  VideoInfoResponse
} from './types';

function createLogger(onLog?: (logs: string[]) => void) {
  const logs: string[] = [];
  return {
    add: (msg: string) => {
      const timestamp = new Date().toLocaleTimeString();
      logs.push(`[${timestamp}] ${msg}`);
      onLog?.([...logs]);
    },
    getLogs: () => logs,
  };
}

function processChunk(
  data: StreamingChunk,
  logger: ReturnType<typeof createLogger>,
  onProgress?: (state: StreamingProgressState) => void
) {
  if (data.type === 'status') {
    logger.add(data.message || 'Processing...');
    return;
  }

  if (data.type === 'complete' || data.is_complete) {
    const qualityScore = data.quality?.percentage_score;
    const msg = qualityScore !== undefined
      ? `✅ Analysis completed successfully with ${qualityScore}% quality score`
      : `✅ Analysis completed successfully`;

    logger.add(msg);
    onProgress?.({
      step: 'complete',
      stepName: 'Analysis Complete',
      status: 'completed',
      message: msg,
      iterationCount: data.iteration_count,
      qualityScore,
    });
    return;
  }

  if (data.quality?.percentage_score !== undefined) {
    const score = data.quality.percentage_score;
    const passed = data.quality.is_acceptable;
    logger.add(`🎯 Quality Check: ${score}% (${passed ? 'Pass' : 'Refine'})`);

    onProgress?.({
      step: passed ? 'quality_check' : 'refinement',
      stepName: passed ? 'Quality Check' : 'Refining',
      status: 'processing',
      message: passed ? 'Quality check passed' : 'Refining analysis...',
      qualityScore: score,
      iterationCount: data.iteration_count,
    });
    return;
  }

  if (data.analysis && !data.quality) {
    onProgress?.({
      step: 'analysis_generation',
      stepName: 'Analysis Generation',
      status: 'completed',
      message: 'Analysis generated',
      iterationCount: data.iteration_count,
    });
  }
}

export async function streamAnalysis(
  url: string,
  options: {
    analysisModel?: string;
    qualityModel?: string;
    targetLanguage?: string | null;
  },
  onProgress?: (state: StreamingProgressState) => void,
  onLog?: (logs: string[]) => void
): Promise<StreamingProcessingResult> {
  const startTime = Date.now();
  const logger = createLogger(onLog);

  try {
    // 1. Scraping Phase
    logger.add('🚀 Starting process...');
    onProgress?.({
      step: 'scraping',
      stepName: 'Scraping Video',
      status: 'processing',
      message: 'Extracting video info...'
    });

    const scrapResult = await api.scrapVideo({ url });

    if (scrapResult.status !== 'success') {
      throw new Error(scrapResult.message || 'Scraping failed');
    }

    const videoInfo: VideoInfoResponse = {
      url: scrapResult.url || url,
      title: scrapResult.title || null,
      thumbnail: scrapResult.thumbnail,
      author: scrapResult.author || null,
      duration: scrapResult.duration,
      upload_date: scrapResult.upload_date,
      view_count: scrapResult.view_count,
      like_count: scrapResult.like_count,
    };

    logger.add(`✅ Scraped: ${videoInfo.title}`);
    onProgress?.({
      step: 'scraping',
      stepName: 'Scraping Video',
      status: 'completed',
      message: `Video scraped: ${videoInfo.title}`,
      data: { videoInfo, transcript: scrapResult.transcript }
    });

    // 2. Analysis Phase (Streaming)
    onProgress?.({
      step: 'analyzing',
      stepName: 'AI Analysis',
      status: 'processing',
      message: 'Connecting to analysis stream...'
    });

    const requestBody: SummarizeRequest = {
      content: scrapResult.transcript || url,
      content_type: scrapResult.transcript ? 'transcript' : 'url',
      analysis_model: options.analysisModel || 'google/gemini-2.5-pro',
      quality_model: options.qualityModel || 'google/gemini-2.5-flash',
      target_language: options.targetLanguage === "auto" ? null : options.targetLanguage,
    };

    const response = await fetch(`${api.baseUrl}/stream-summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) throw new Error(`Stream connection failed: ${response.statusText}`);
    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let analysis: AnalysisData | undefined;
    let quality: QualityData | undefined;
    let iterationCount = 0;
    let chunksProcessed = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkText = decoder.decode(value, { stream: true });
      const lines = chunkText.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        try {
          const data: StreamingChunk = JSON.parse(line.slice(6));
          chunksProcessed++;

          if (data.analysis) analysis = data.analysis;
          if (data.quality) quality = data.quality;
          if (data.iteration_count) iterationCount = data.iteration_count;

          processChunk(data, logger, onProgress);
        } catch (e) {
          // Ignore parse errors for partial chunks
        }
      }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
    logger.add(`🏁 Completed in ${totalTime}`);

    return {
      success: true,
      videoInfo,
      transcript: scrapResult.transcript,
      analysis,
      quality,
      totalTime,
      iterationCount,
      chunksProcessed,
      logs: logger.getLogs()
    };

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.add(`❌ Error: ${msg}`);

    const apiError: ApiError = {
      message: msg,
      type: 'processing'
    };

    onProgress?.({
      step: 'analyzing',
      stepName: 'Processing',
      status: 'error',
      message: msg,
      error: apiError
    });

    return {
      success: false,
      totalTime: ((Date.now() - startTime) / 1000).toFixed(1) + 's',
      iterationCount: 0,
      chunksProcessed: 0,
      logs: logger.getLogs(),
      error: apiError
    };
  }
}
