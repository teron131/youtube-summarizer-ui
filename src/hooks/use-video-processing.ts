import {
  ApiError,
  streamingProcessing,
  StreamingProcessingResult,
  StreamingProgressState,
  VideoInfoResponse,
} from '@/services/api';
import { useCallback, useState } from 'react';

export interface VideoProcessingOptions {
  analysisModel?: string;
  qualityModel?: string;
  targetLanguage?: string;
}

export interface VideoProcessingState {
  isLoading: boolean;
  error: ApiError | null;
  currentStep: number;
  currentStage: string;
  progressStates: StreamingProgressState[];
  streamingLogs: string[];
  analysisResult: StreamingProcessingResult | null;
  scrapedVideoInfo: VideoInfoResponse | null;
  scrapedTranscript: string | null;
}

type StateUpdater = (updates: Partial<VideoProcessingState>) => void;

const initialState: VideoProcessingState = {
  isLoading: false,
  error: null,
  currentStep: 0,
  currentStage: '',
  progressStates: [],
  streamingLogs: [],
  analysisResult: null,
  scrapedVideoInfo: null,
  scrapedTranscript: null,
};

export function useVideoProcessing() {
  const [state, setState] = useState<VideoProcessingState>(initialState);

  // Unified state updater
  const updateState: StateUpdater = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Reset to initial state
  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  // Individual setters for backward compatibility
  const setLoading = useCallback((isLoading: boolean) => {
    updateState({ isLoading });
  }, [updateState]);

  const setError = useCallback((error: ApiError | null) => {
    updateState({ error });
  }, [updateState]);

  const setCurrentStep = useCallback((currentStep: number) => {
    updateState({ currentStep });
  }, [updateState]);

  const setCurrentStage = useCallback((currentStage: string) => {
    updateState({ currentStage });
  }, [updateState]);

  const setProgressStates = useCallback((states: StreamingProgressState[] | ((prev: StreamingProgressState[]) => StreamingProgressState[])) => {
    setState(prev => ({
      ...prev,
      progressStates: typeof states === 'function' ? states(prev.progressStates) : states,
    }));
  }, []);

  const setStreamingLogs = useCallback((streamingLogs: string[]) => {
    updateState({ streamingLogs });
  }, [updateState]);

  const setAnalysisResult = useCallback((analysisResult: StreamingProcessingResult | null) => {
    updateState({ analysisResult });
  }, [updateState]);

  const setScrapedVideoInfo = useCallback((scrapedVideoInfo: VideoInfoResponse | null) => {
    updateState({ scrapedVideoInfo });
  }, [updateState]);

  const setScrapedTranscript = useCallback((scrapedTranscript: string | null) => {
    updateState({ scrapedTranscript });
  }, [updateState]);

  const processVideo = useCallback(async (
    url: string,
    options?: VideoProcessingOptions,
    onProgress?: (state: StreamingProgressState) => void
  ): Promise<StreamingProcessingResult> => {
    // Reset state for new processing
    updateState({
      isLoading: true,
      error: null,
      analysisResult: null,
      currentStep: 0,
      currentStage: 'Initializing...',
      progressStates: [],
      streamingLogs: [],
      scrapedVideoInfo: null,
      scrapedTranscript: null,
    });

    const result = await streamingProcessing(
      url,
      onProgress,
      (logs: string[]) => updateState({ streamingLogs: logs }),
      options
    );

    if (result.success) {
      updateState({
        scrapedVideoInfo: result.videoInfo || null,
        scrapedTranscript: result.transcript || null,
        analysisResult: result,
        currentStage: 'Processing completed',
        isLoading: false,
      });
    } else {
      updateState({ isLoading: false });
      throw result.error || new Error('Processing failed');
    }

    return result;
  }, [updateState]);

  return {
    ...state,
    resetState,
    setLoading,
    setError,
    setCurrentStep,
    setCurrentStage,
    setProgressStates,
    setStreamingLogs,
    setAnalysisResult,
    setScrapedVideoInfo,
    setScrapedTranscript,
    processVideo,
  };
}

