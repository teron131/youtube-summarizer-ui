/**
 * Streaming API utilities for real-time progress updates
 */

import type {
    AnalysisData,
    QualityData,
    StreamingChunk,
    StreamingProcessingResult,
    StreamingProgressState,
    SummarizeRequest
} from './api-types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_VERSION = "3.0.0";

/**
 * Stream AI analysis with real-time progress updates
 */
export async function streamSummarizeContent(request: SummarizeRequest): Promise<ReadableStream<Uint8Array>> {
  const url = `${API_BASE_URL || '/api'}/stream-summarize`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': `YouTube-Summarizer-Frontend/${API_VERSION}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `HTTP ${response.status}: ${response.statusText}`,
      detail: response.statusText
    }));

    throw {
      message: `Request failed with status ${response.status}`,
      status: response.status,
      type: response.status >= 500 ? 'server' : 'validation',
      details: JSON.stringify(errorData)
    };
  }

  return response.body!;
}

/**
 * Process streaming chunks and emit progress updates
 */
export async function processStreamingChunks(
  stream: ReadableStream<Uint8Array>,
  onProgress?: (state: StreamingProgressState) => void,
  onLogUpdate?: (logs: string[]) => void
): Promise<StreamingProcessingResult> {
  const startTime = Date.now();
  const streamingLogs: string[] = [];
  let analysis: AnalysisData | undefined;
  let quality: QualityData | undefined;
  let iterationCount = 0;
  let chunksProcessed = 0;
  let finalWorkflowState: StreamingChunk | null = null;

  const phaseStartTimes: {
    analysisStart?: number;
    qualityStart?: number;
    refinementStart?: number;
  } = {};
  let refinementInProgress = false;

  const reader = stream.getReader();
  const decoder = new TextDecoder();

  try {
    // Log analysis start
    phaseStartTimes.analysisStart = Date.now();
    streamingLogs.push(`[${new Date().toLocaleTimeString()}] 🚀 Starting AI analysis...`);
    onLogUpdate?.([...streamingLogs]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        const jsonData = line.slice(6).trim();
        if (!jsonData || jsonData === '{}') continue;

        try {
          const data = JSON.parse(jsonData) as StreamingChunk;
          chunksProcessed++;
          finalWorkflowState = data;

          // Extract data from workflow state
          if (data.analysis) analysis = data.analysis;
          if (data.quality) quality = data.quality;
          if (data.iteration_count !== undefined) iterationCount = data.iteration_count;
          if (data.type === 'complete') data.is_complete = true;

          // Process log messages and progress updates
          processChunkUpdate(data, {
            chunksProcessed,
            phaseStartTimes,
            refinementInProgress,
            streamingLogs,
            onProgress,
            onLogUpdate,
            startTime
          });

          // Update refinement tracking
          if (data.quality && !data.quality.is_acceptable) {
            if (!refinementInProgress) {
              phaseStartTimes.refinementStart = Date.now();
              refinementInProgress = true;
            }
          } else if (data.quality && data.quality.is_acceptable) {
            refinementInProgress = false;
          }

        } catch (parseError) {
          handleMalformedChunk(line, streamingLogs, onProgress, onLogUpdate);
        }
      }
    }

    // Emit final logs
    emitFinalLogs(finalWorkflowState, analysis, quality, iterationCount, startTime, streamingLogs, onLogUpdate);

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
    return {
      success: true,
      analysis,
      quality,
      totalTime,
      iterationCount,
      chunksProcessed,
      logs: streamingLogs
    };

  } finally {
    reader.releaseLock();
  }
}

/**
 * Process individual chunk updates
 */
function processChunkUpdate(
  data: StreamingChunk,
  context: {
    chunksProcessed: number;
    phaseStartTimes: Record<string, number | undefined>;
    refinementInProgress: boolean;
    streamingLogs: string[];
    onProgress?: (state: StreamingProgressState) => void;
    onLogUpdate?: (logs: string[]) => void;
    startTime: number;
  }
) {
  const { chunksProcessed, phaseStartTimes, streamingLogs, onProgress, onLogUpdate, startTime } = context;
  const timestamp = new Date(data.timestamp || Date.now()).toLocaleTimeString();
  const displayIteration = (data.iteration_count ?? 0) + 1;
  const msToSecondsString = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

  let logMessage = '';

  if (data.is_complete && data.analysis && data.quality) {
    const qualityScore = data.quality.percentage_score;
    const chaptersCount = data.analysis.chapters?.length || 0;
    logMessage = qualityScore !== undefined
      ? `✅ Analysis completed successfully! Generated ${chaptersCount} chapters with ${qualityScore}% quality score`
      : `✅ Analysis completed successfully! Generated ${chaptersCount} chapters`;

    onProgress?.({
      step: 'complete',
      stepName: 'Analysis Complete',
      status: 'completed',
      message: logMessage,
      iterationCount: displayIteration,
      qualityScore,
      chunkCount: chunksProcessed,
      processingTime: msToSecondsString(Date.now() - startTime)
    });
  } else if (data.quality && data.iteration_count !== undefined) {
    const qualityScore = data.quality.percentage_score;
    const isAcceptable = data.quality.is_acceptable ?? (qualityScore !== undefined && qualityScore >= 90);

    logMessage = isAcceptable
      ? (qualityScore !== undefined ? `🎯 Quality check passed with ${qualityScore}% score` : '🎯 Quality check passed')
      : (qualityScore !== undefined ? `🔄 Quality check: ${qualityScore}% score (needs improvement)` : '🔄 Quality check: needs improvement');

    const qcDuration = phaseStartTimes.qualityStart ? msToSecondsString(Date.now() - phaseStartTimes.qualityStart) : undefined;

    onProgress?.({
      step: 'quality_check',
      stepName: 'Quality Assessment',
      status: 'completed',
      message: logMessage,
      iterationCount: displayIteration,
      qualityScore,
      processingTime: qcDuration
    });
  } else if (data.analysis && data.iteration_count === 1 && !data.quality) {
    const chaptersCount = data.analysis.chapters?.length || 0;
    const duration = phaseStartTimes.analysisStart ? msToSecondsString(Date.now() - phaseStartTimes.analysisStart) : undefined;
    logMessage = duration ? `📝 Initial analysis generated with ${chaptersCount} chapters (${duration})` : `📝 Initial analysis generated with ${chaptersCount} chapters`;

    phaseStartTimes.qualityStart = Date.now();
    onProgress?.({
      step: 'analysis_generation',
      stepName: 'Analysis Generation',
      status: 'completed',
      message: logMessage,
      iterationCount: displayIteration,
      processingTime: duration
    });
  }

  if (logMessage) {
    streamingLogs.push(`[${timestamp}] ${logMessage}`);
    onLogUpdate?.([...streamingLogs]);
  }
}

/**
 * Handle malformed chunks
 */
function handleMalformedChunk(
  line: string,
  streamingLogs: string[],
  onProgress?: (state: StreamingProgressState) => void,
  onLogUpdate?: (logs: string[]) => void
) {
  const isCompleteChunk = line.includes('"type": "complete"') || line.includes('"is_complete": true');

  if (isCompleteChunk) {
    const timestamp = new Date().toLocaleTimeString();
    streamingLogs.push(`[${timestamp}] Analysis completed (completion detected)`);

    onProgress?.({
      step: 'complete',
      stepName: 'Analysis Complete',
      status: 'completed',
      message: 'Analysis completed successfully'
    });
  } else {
    const timestamp = new Date().toLocaleTimeString();
    streamingLogs.push(`[${timestamp}] Malformed chunk skipped`);
  }

  onLogUpdate?.([...streamingLogs]);
}

/**
 * Emit final workflow logs
 */
function emitFinalLogs(
  finalWorkflowState: StreamingChunk | null,
  analysis: AnalysisData | undefined,
  quality: QualityData | undefined,
  iterationCount: number,
  startTime: number,
  streamingLogs: string[],
  onLogUpdate?: (logs: string[]) => void
) {
  if (!finalWorkflowState) return;

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
  const timestamp = new Date().toLocaleTimeString();

  streamingLogs.push(`[${timestamp}] 🏁 Workflow completed successfully in ${totalTime}`);
  streamingLogs.push(`[${timestamp}] Summary: ${iterationCount} iterations processed`);

  if (analysis?.chapters?.length) {
    streamingLogs.push(`[${timestamp}] 📚 Generated ${analysis.chapters.length} video chapters`);
  }

  if (quality?.percentage_score !== undefined) {
    const qualityEmoji = quality.percentage_score >= 80 ? '🌟' : quality.percentage_score >= 60 ? '⭐' : '🔄';
    streamingLogs.push(`[${timestamp}] ${qualityEmoji} Final quality score: ${quality.percentage_score}%`);
  }

  onLogUpdate?.([...streamingLogs]);
}

