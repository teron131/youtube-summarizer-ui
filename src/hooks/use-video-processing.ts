import { findStepIndex, normalizeStepName, sortProgressStates } from '@/lib/video-utils';
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
type ProgressStateWithData = StreamingProgressState & {
  data?: { videoInfo?: VideoInfoResponse; transcript?: string };
};

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

  const updateState: StateUpdater = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  const setLoading = useCallback(
    (isLoading: boolean) => updateState({ isLoading }),
    [updateState],
  );

  const setError = useCallback(
    (error: ApiError | null) => updateState({ error }),
    [updateState],
  );

  const setCurrentStep = useCallback(
    (currentStep: number) => updateState({ currentStep }),
    [updateState],
  );

  const setCurrentStage = useCallback(
    (currentStage: string) => updateState({ currentStage }),
    [updateState],
  );

  const setProgressStates = useCallback(
    (
      states:
        | StreamingProgressState[]
        | ((prev: StreamingProgressState[]) => StreamingProgressState[]),
    ) => {
      setState((prev) => ({
        ...prev,
        progressStates: typeof states === 'function' ? states(prev.progressStates) : states,
      }));
    },
    [],
  );

  const setStreamingLogs = useCallback(
    (streamingLogs: string[]) => updateState({ streamingLogs }),
    [updateState],
  );

  const setAnalysisResult = useCallback(
    (analysisResult: StreamingProcessingResult | null) => updateState({ analysisResult }),
    [updateState],
  );

  const setScrapedVideoInfo = useCallback(
    (scrapedVideoInfo: VideoInfoResponse | null) => updateState({ scrapedVideoInfo }),
    [updateState],
  );

  const setScrapedTranscript = useCallback(
    (scrapedTranscript: string | null) => updateState({ scrapedTranscript }),
    [updateState],
  );

  const applyProgressUpdate = useCallback((progressState: ProgressStateWithData) => {
    setState((prev) => {
      const normalizedStep = normalizeStepName(progressState.step);
      const stepIndex = findStepIndex(normalizedStep);
      const nextStates = [...prev.progressStates];
      const normalizedProgress = { ...progressState, step: normalizedStep };
      const existingIndex = nextStates.findIndex((state) => state.step === normalizedStep);

      if (existingIndex >= 0) {
        nextStates[existingIndex] = normalizedProgress;
      } else {
        nextStates.push(normalizedProgress);
      }

      const data = progressState.data;

      return {
        ...prev,
        currentStep: stepIndex >= 0 ? stepIndex : prev.currentStep,
        currentStage: progressState.message,
        progressStates: sortProgressStates(nextStates),
        scrapedVideoInfo: data?.videoInfo ?? prev.scrapedVideoInfo,
        scrapedTranscript: data?.transcript ?? prev.scrapedTranscript,
      };
    });
  }, []);

  const processVideo = useCallback(
    async (
      url: string,
      options?: VideoProcessingOptions,
      onProgress?: (state: StreamingProgressState) => void,
    ): Promise<StreamingProcessingResult> => {
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

      const handleProgress = (progressState: StreamingProgressState) => {
        applyProgressUpdate(progressState);
        onProgress?.(progressState);
      };

      const result = await streamingProcessing(
        url,
        handleProgress,
        (logs: string[]) => updateState({ streamingLogs: logs }),
        options,
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
    },
    [applyProgressUpdate, updateState],
  );

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
