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
  const logs: string[] = [];
  
  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${msg}`;
    logs.push(logEntry);
    onLog?.([...logs]);
  };

  try {
    // 1. Scraping Phase
    addLog('🚀 Starting process...');
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
      thumbnail: scrapResult.thumbnail || undefined,
      author: scrapResult.author || null,
      duration: scrapResult.duration || undefined,
      upload_date: scrapResult.upload_date || undefined,
      view_count: scrapResult.view_count || undefined,
      like_count: scrapResult.like_count || undefined,
    };
    
    addLog(`✅ Scraped: ${videoInfo.title}`);
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

          // Update state
          if (data.analysis) analysis = data.analysis;
          if (data.quality) quality = data.quality;
          if (data.iteration_count) iterationCount = data.iteration_count;

          // Emit progress based on chunk type
          if (data.type === 'status') {
            addLog(data.message || 'Processing...');
          } else if (data.quality && data.quality.percentage_score !== undefined) {
             const score = data.quality.percentage_score;
             const passed = data.quality.is_acceptable;
             addLog(`🎯 Quality Check: ${score}% (${passed ? 'Pass' : 'Refine'})`);
             
             onProgress?.({
               step: passed ? 'quality_check' : 'refinement',
               stepName: passed ? 'Quality Check' : 'Refining',
               status: 'processing',
               message: passed ? 'Quality check passed' : 'Refining analysis...',
               qualityScore: score,
               iterationCount
             });
          }
          
        } catch (e) {
          // Ignore parse errors for partial chunks
        }
      }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
    addLog(`🏁 Completed in ${totalTime}`);

    return {
      success: true,
      videoInfo,
      transcript: scrapResult.transcript || undefined,
      analysis,
      quality,
      totalTime,
      iterationCount,
      chunksProcessed,
      logs
    };

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    addLog(`❌ Error: ${msg}`);
    
    const apiError: ApiError = {
      message: msg,
      type: 'processing'
    };

    onProgress?.({
        step: 'analyzing', // Default to analyzing failure
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
      logs,
      error: apiError
    };
  }
}

