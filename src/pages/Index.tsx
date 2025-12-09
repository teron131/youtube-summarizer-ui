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
import { useState } from "react";

const Index = () => {
  const [initialUrl] = useState<string>(getVideoIdFromParams());
  const [isExampleMode, setIsExampleMode] = useState(false);
  const { toast } = useToast();

  const {
    isLoading,
    error,
    currentStep,
    currentStage,
    progressStates,
    analysisResult,
    scrapedVideoInfo,
    scrapedTranscript,
    setError,
    setCurrentStep,
    setCurrentStage,
    setProgressStates,
    setAnalysisResult,
    setScrapedVideoInfo,
    setScrapedTranscript,
    setLoading,
    processVideo,
  } = useVideoProcessing();

  const loadExample = () => {
    setIsExampleMode(false);
    setCurrentStage("Loading example...");

    const example = loadExampleData();

    setProgressStates(example.progressStates);
    setScrapedVideoInfo(example.videoInfo);
    setScrapedTranscript(example.transcript);
    setAnalysisResult(example.analysisResult);
    setCurrentStep(4);
    setCurrentStage("Example ready");
    setLoading(false);
  };

  const handleVideoSubmit = async (url: string, options?: VideoProcessingOptions) => {
    setIsExampleMode(false);

    // Use example data if URL is empty
    if (!url.trim()) {
      loadExample();
      return;
    }

    try {
      const result = await processVideo(url, options);

      console.log('🎉 Streaming completed successfully:', {
        hasVideoInfo: !!result.videoInfo,
        hasTranscript: !!result.transcript,
        hasAnalysis: !!result.analysis,
        hasQuality: !!result.quality,
        analysisChapters: result.analysis?.chapters?.length || 0,
        qualityScore: result.quality?.percentage_score || 0
      });
    } catch (error) {
      const apiError = handleApiError(error);
      setError(apiError);
      setCurrentStage("❌ Processing failed");

      toast({
        title: "Processing Failed",
        description: apiError.message,
        variant: "destructive",
      });

      console.error('Processing error:', apiError.message, 'Details:', apiError.details);
    }
  };

  const videoInfo = analysisResult?.videoInfo || scrapedVideoInfo;
  const transcript = analysisResult?.transcript || scrapedTranscript;

  return (
    <div className="min-h-screen bg-background">
      <HeroSection 
        onSubmit={handleVideoSubmit} 
        isLoading={isLoading} 
        initialUrl={initialUrl}
      />

      <div className="relative bg-background">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(255,0,76,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(255,0,76,0.06),transparent_28%)]" />

        <div className="container relative z-10 mx-auto px-4 pb-16 -mt-12">
          <div className="max-w-full mx-auto space-y-10">
            {/* Video Info */}
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

            {/* Transcript */}
            {!isExampleMode && transcript && (
              <TranscriptPanel transcript={transcript} />
            )}

            {/* AI Analysis */}
            {!isExampleMode && analysisResult?.analysis && (
              <AnalysisPanel
                analysis={analysisResult.analysis}
                quality={analysisResult.quality}
                videoInfo={analysisResult.videoInfo}
              />
            )}

            {/* Loading State */}
            {isLoading && (
              <ProcessingStatus
                currentStage={currentStage}
                currentStep={currentStep}
                progressStates={progressStates}
              />
            )}

            {/* Error State */}
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
