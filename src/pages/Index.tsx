import { useState } from "react";
import { VideoUrlForm } from "@/components/VideoUrlForm";
import { VideoInfo } from "@/components/VideoInfo";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { SummaryPanel } from "@/components/SummaryPanel";
import { useToast } from "@/hooks/use-toast";
import {
  getVideoInfo,
  processVideo,
  isValidYouTubeUrl,
  handleApiError,
  VideoInfoResponse,
  ProcessingResultData,
  ProcessingResponse,
  ApiError,
} from "@/services/api";
import { Card } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import heroBackground from "@/assets/youtube-subtle-background.jpg";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfoResponse | null>(null);
  const [processingResult, setProcessingResult] = useState<ProcessingResultData | null>(null);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [currentStage, setCurrentStage] = useState<string>("");
  const { toast } = useToast();

  const handleVideoSubmit = async (url: string) => {
    // Validate YouTube URL format
    if (!isValidYouTubeUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    // Reset state
    setIsLoading(true);
    setVideoInfo(null);
    setProcessingResult(null);
    setProcessingLogs([]);
    setError(null);
    setCurrentStage("Starting workflow...");

    try {
      // Step 1: Get Video Info
      setCurrentStage("Fetching video information...");
      const info = await getVideoInfo(url);
      setVideoInfo(info);

      // Step 2: Process Video
      setCurrentStage("Processing video (transcription & summary)...");
      const response = await processVideo(url, true);
      setProcessingLogs(response.logs);

      if (response.status === 'success' && response.data) {
        setProcessingResult(response.data);
        setCurrentStage("Completed");
        toast({
          title: "Processing Complete!",
          description: `Video processed successfully in ${response.data.processing_time}`,
        });
      } else {
        throw new Error(response.message || 'An unknown processing error occurred');
      }
    } catch (error) {
      const apiError = handleApiError(error);
      setError(apiError);
      setCurrentStage("Failed");
      toast({
        title: "Processing Failed",
        description: apiError.message,
        variant: "destructive",
      });
      console.error('Processing error:', apiError.message, 'Details:', apiError.details);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden min-h-screen flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center space-y-8 mb-16">
            <div className="fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-primary text-sm font-medium">Powered by Whisper and Gemini</span>
              </div>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black text-foreground fade-in-up stagger-1">
              YouTube
              <br />
              <span className="text-primary animate-glow bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Summarizer
              </span>
            </h1>
            
            <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed fade-in-up stagger-2">
              Transform any YouTube video into concise, intelligent summaries. 
              <br />
              <span className="text-primary font-semibold">Advanced AI transcription</span> meets 
              <span className="text-primary font-semibold"> smart analysis</span> for instant insights.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground fade-in-up stagger-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>Real-time Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>High Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>Multiple Formats</span>
              </div>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto fade-in-up stagger-4">
            <VideoUrlForm onSubmit={handleVideoSubmit} isLoading={isLoading} />
          </div>
        </div>
      </div>

      {/* Results and Status Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Loading State */}
          {isLoading && (
            <Card className="p-10 modern-blur shadow-glass">
              <div className="space-y-8">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Clock className="w-10 h-10 text-white animate-spin" />
                    </div>
                    <div className="absolute inset-0 w-20 h-20 bg-primary/30 rounded-full animate-ping"></div>
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-bold text-foreground">Processing Video</h3>
                  <p className="text-xl text-muted-foreground">({currentStage})</p>
                  <div className="w-full bg-muted/30 rounded-full h-2 mt-4">
                    <div className="bg-gradient-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
                
                {processingLogs.length > 0 && (
                  <div className="glass-effect rounded-2xl p-6 max-h-64 overflow-y-auto border border-primary/10">
                    <div className="space-y-2">
                      {processingLogs.map((log, index) => (
                        <div key={index} className="text-sm text-foreground font-mono opacity-80">
                          → {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Card className="p-6 bg-gradient-card border border-destructive shadow-card backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <h3 className="text-lg font-semibold text-destructive">{error.message}</h3>
              </div>
              
              {processingLogs.length > 0 && (
                <div className="mt-4 bg-muted/30 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <div className="space-y-1">
                    {processingLogs.map((log, index) => (
                      <div key={index} className="text-sm text-foreground font-mono">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Success State */}
          {!isLoading && !error && (processingResult || videoInfo) && (
            <>
              {currentStage === "Completed" && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Processing completed successfully!</span>
                </div>
              )}
              
              {(videoInfo || processingResult) && (
                 <VideoInfo
                    title={processingResult?.title || videoInfo?.title || "Loading..."}
                    author={processingResult?.author || videoInfo?.author || "Loading..."}
                    thumbnail={processingResult?.thumbnail || videoInfo?.thumbnail}
                    duration={processingResult?.duration || videoInfo?.duration}
                    view_count={processingResult?.view_count || videoInfo?.view_count}
                    upload_date={processingResult?.upload_date || videoInfo?.upload_date}
                 />
              )}
            
              {processingResult && (
                <>
                  <SummaryPanel summary={processingResult.summary || "Summary generation was skipped or failed."} />
                  <TranscriptPanel transcript={processingResult.transcript} />
                </>
              )}

              {/* Processing Logs for successful runs */}
              {processingLogs.length > 0 && currentStage === "Completed" && (
                <Card className="bg-gradient-card border border-muted shadow-card backdrop-blur-sm">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Processing Log</h3>
                    <div className="bg-muted/30 rounded-lg p-4 max-h-48 overflow-y-auto">
                      <div className="space-y-1">
                        {processingLogs.map((log, index) => (
                          <div key={index} className="text-sm text-muted-foreground font-mono">
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-muted py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Powered by Whisper and Gemini
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
