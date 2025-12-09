import {
    ApiError,
    streamingProcessing,
    StreamingProcessingResult,
    StreamingProgressState,
    VideoInfoResponse,
} from '@/services/api';
import { useState } from 'react';

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

export function useVideoProcessing() {
  const [state, setState] = useState<VideoProcessingState>({
    isLoading: false,
    error: null,
    currentStep: 0,
    currentStage: '',
    progressStates: [],
    streamingLogs: [],
    analysisResult: null,
    scrapedVideoInfo: null,
    scrapedTranscript: null,
  });

  const resetState = () => {
    setState({
      isLoading: false,
      error: null,
      currentStep: 0,
      currentStage: '',
      progressStates: [],
      streamingLogs: [],
      analysisResult: null,
      scrapedVideoInfo: null,
      scrapedTranscript: null,
    });
  };

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  };

  const setError = (error: ApiError | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const setCurrentStep = (step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const setCurrentStage = (stage: string) => {
    setState(prev => ({ ...prev, currentStage: stage }));
  };

  const setProgressStates = (states: StreamingProgressState[] | ((prev: StreamingProgressState[]) => StreamingProgressState[])) => {
    setState(prev => ({
      ...prev,
      progressStates: typeof states === 'function' ? states(prev.progressStates) : states,
    }));
  };

  const setStreamingLogs = (logs: string[]) => {
    setState(prev => ({ ...prev, streamingLogs: logs }));
  };

  const setAnalysisResult = (result: StreamingProcessingResult | null) => {
    setState(prev => ({ ...prev, analysisResult: result }));
  };

  const setScrapedVideoInfo = (info: VideoInfoResponse | null) => {
    setState(prev => ({ ...prev, scrapedVideoInfo: info }));
  };

  const setScrapedTranscript = (transcript: string | null) => {
    setState(prev => ({ ...prev, scrapedTranscript: transcript }));
  };

  const processVideo = async (
    url: string,
    options?: VideoProcessingOptions,
    onProgress?: (state: StreamingProgressState) => void
  ): Promise<StreamingProcessingResult> => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    setCurrentStep(0);
    setCurrentStage('Initializing...');
    setProgressStates([]);
    setStreamingLogs([]);
    setScrapedVideoInfo(null);
    setScrapedTranscript(null);

    const result = await streamingProcessing(
      url,
      (progressState: StreamingProgressState) => {
        if (onProgress) onProgress(progressState);
      },
      (logs: string[]) => {
        setStreamingLogs(logs);
      },
      options
    );

    if (result.success) {
      setScrapedVideoInfo(result.videoInfo || null);
      setScrapedTranscript(result.transcript || null);
      setAnalysisResult(result);
      setCurrentStage('Processing completed');
    } else {
      throw result.error || new Error('Processing failed');
    }

    setLoading(false);
    return result;
  };

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

