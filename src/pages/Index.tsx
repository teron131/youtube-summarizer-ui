/**
 * Main page component orchestrating the video processing workflow.
 */

import { AnalysisPanel } from "@/components/AnalysisPanel";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { HeroSection } from "@/components/HeroSection";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { VideoInfo } from "@/components/VideoInfo";
import { useToast } from "@/hooks/use-toast";
import { useVideoProcessing, VideoProcessingOptions } from "@/hooks/use-video-processing";
import { loadExampleData } from "@/lib/example-data-loader";
import { getVideoIdFromParams } from "@/lib/video-utils";
import { handleApiError } from "@/services/api";
import { useEffect, useState } from "react";

const Index = () => {
  const [initialUrl] = useState<string>(getVideoIdFromParams());
  const [isExampleMode, setIsExampleMode] = useState(false);
  const [lastProcessedUrl, setLastProcessedUrl] = useState<string>("");
  const [lastOptions, setLastOptions] = useState<VideoProcessingOptions>();
  const { toast } = useToast();
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

  const {
    isLoading,
    error,
    currentStep,
    currentStage,
    progressStates,
    analysisResult,
    scrapedVideoInfo,
    scrapedTranscript,
    updateState,
    processVideo,
  } = useVideoProcessing();

  const loadExample = () => {
    setIsExampleMode(false);
    const example = loadExampleData();

    updateState({
      currentStage: "Example ready",
      currentStep: 4,
      progressStates: example.progressStates,
      scrapedVideoInfo: example.videoInfo,
      scrapedTranscript: example.transcript,
      analysisResult: example.analysisResult,
      isLoading: false,
    });
  };

  useEffect(() => {
    if (isDemoMode) {
      loadExample();
    }
  }, [isDemoMode]);

  const handleVideoSubmit = async (url: string, options?: VideoProcessingOptions) => {
    if (isDemoMode) {
      toast({
        title: "Demo Mode",
        description: "This static demo shows example data without calling the API.",
      });
      loadExample();
      return;
    }

    setIsExampleMode(false);

    if (!url.trim()) {
      loadExample();
      return;
    }

    setLastProcessedUrl(url);
    setLastOptions(options);

    try {
      await processVideo(url, options);
    } catch (error) {
      const apiError = handleApiError(error);
      updateState({ error: apiError, currentStage: "❌ Processing failed" });

      toast({
        title: "Processing Failed",
        description: apiError.message,
        variant: "destructive",
      });

      console.error('Processing error:', apiError.message, 'Details:', apiError.details);
    }
  };

  const handleRegenerate = async () => {
    if (!lastProcessedUrl) return;
    await handleVideoSubmit(lastProcessedUrl, lastOptions);
  };

  const videoInfo = analysisResult?.videoInfo || scrapedVideoInfo;
  const transcript = analysisResult?.transcript || scrapedTranscript;

  return (
    <div className="min-h-screen bg-[#0b0b0c]">
      <HeroSection
        onSubmit={handleVideoSubmit}
        isLoading={isLoading}
        initialUrl={initialUrl}
      />

      <div className="relative">
        <div className="container relative z-10 mx-auto px-6 sm:px-8 pb-16 -mt-12">
          <div className="max-w-8xl w-full mx-auto space-y-10">
            {!isExampleMode && videoInfo && (
              <VideoInfo
                url={videoInfo.url}
                title={videoInfo.title}
                thumbnail={videoInfo.thumbnail}
                author={videoInfo.author}
                duration={videoInfo.duration}
                upload_date={videoInfo.upload_date}
                view_count={videoInfo.view_count}
                like_count={videoInfo.like_count}
              />
            )}

            {!isExampleMode && transcript && (
              <TranscriptPanel transcript={transcript} />
            )}

            {!isExampleMode && analysisResult?.analysis && (
              <AnalysisPanel
                analysis={analysisResult.analysis}
                quality={analysisResult.quality}
                videoInfo={analysisResult.videoInfo}
                onRegenerate={handleRegenerate}
                isRegenerating={isLoading}
              />
            )}

            {isLoading && (
              <ProcessingStatus
                currentStage={currentStage}
                currentStep={currentStep}
                progressStates={progressStates}
              />
            )}

            {error && !isLoading && (
              <ErrorDisplay
                error={error}
                progressStates={progressStates}
                onLoadExample={loadExample}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
