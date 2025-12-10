import { findStepIndex, normalizeStepName, sortProgressStates } from '@/lib/video-utils';
import { streamAnalysis } from '@/services/streaming';
import {
  ApiError,
  StreamingProcessingResult,
  StreamingProgressState,
  VideoInfoResponse,
} from '@/services/types';
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
  analysisResult: StreamingProcessingResult | null;
  scrapedVideoInfo: VideoInfoResponse | null;
  scrapedTranscript: string | null;
}

const initialState: VideoProcessingState = {
  isLoading: false,
  error: null,
  currentStep: 0,
  currentStage: '',
  progressStates: [],
  analysisResult: null,
  scrapedVideoInfo: null,
  scrapedTranscript: null,
};

export function useVideoProcessing() {
  const [state, setState] = useState<VideoProcessingState>(initialState);

  const applyProgressUpdate = (progressState: StreamingProgressState) => {
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

      return {
        ...prev,
        currentStep: stepIndex >= 0 ? stepIndex : prev.currentStep,
        currentStage: progressState.message,
        progressStates: sortProgressStates(nextStates),
        scrapedVideoInfo: progressState.data?.videoInfo ?? prev.scrapedVideoInfo,
        scrapedTranscript: progressState.data?.transcript ?? prev.scrapedTranscript,
      };
    });
  };

  const processVideo = async (
    url: string,
    options?: VideoProcessingOptions,
    onProgress?: (state: StreamingProgressState) => void,
  ): Promise<StreamingProcessingResult> => {
    setState({
      isLoading: true,
      error: null,
      analysisResult: null,
      currentStep: 0,
      currentStage: 'Initializing...',
      progressStates: [],
      scrapedVideoInfo: null,
      scrapedTranscript: null,
    });

    const handleProgress = (progressState: StreamingProgressState) => {
      applyProgressUpdate(progressState);
      onProgress?.(progressState);
    };

    try {
      const result = await streamAnalysis(url, options || {}, handleProgress);

      if (!result.success) {
        throw result.error || new Error('Processing failed');
      }

      setState((prev) => ({
        ...prev,
        scrapedVideoInfo: result.videoInfo || null,
        scrapedTranscript: result.transcript || null,
        analysisResult: result,
        currentStage: 'Processing completed',
        isLoading: false,
      }));

      return result;
    } catch (e) {
      const error = e as ApiError;
      setState((prev) => ({ ...prev, isLoading: false, error }));
      throw error;
    }
  };

  const updateState = (updates: Partial<VideoProcessingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  return {
    ...state,
    processVideo,
    updateState,
    resetState: () => setState(initialState),
  };
}
