import heroBackground from "@/assets/youtube-subtle-background.jpg";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { Card } from "@/components/ui/card";
import { VideoInfo } from "@/components/VideoInfo";
import { VideoUrlForm } from "@/components/VideoUrlForm";
import { useToast } from "@/hooks/use-toast";
import {
  ApiError,
  generateComprehensiveAnalysis,
  GenerateResponse,
  handleApiError,
} from "@/services/api";
import { exampleData } from "@/services/example-data";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [currentStage, setCurrentStage] = useState<string>("");
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);

  // Consolidated state for the response data
  const [analysisResult, setAnalysisResult] = useState<GenerateResponse | null>(null);

  const { toast } = useToast();

  const handleVideoSubmit = async (url: string) => {
    // Set loading state immediately
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setProcessingLogs(["🚀 Starting comprehensive analysis..."]);
    
    try {
      const finalUrl = url;
      
      // Use local example data if URL is empty
      // if (!url.trim()) {
      //   setCurrentStage("Loading example...");
      //   setAnalysisResult(exampleData);
      //   setIsLoading(false);
      //   toast({
      //     title: "Example Loaded!",
      //     description: "Example analysis loaded successfully to demonstrate capabilities.",
      //   });
      //   return;
      // }

      // Single API call to the new master endpoint
      setCurrentStage("Processing video... (this may take a moment)");
      const response = exampleData;
      // const response = await generateComprehensiveAnalysis({
      //   url: finalUrl,
      //   include_metadata: true,
      //   include_transcript: true,
      //   include_summary: true,
      //   include_analysis: true,
      // });

      setProcessingLogs(response.logs || []);

      if (response.status === 'success') {
        setAnalysisResult(response);
        setCurrentStage("Completed");
        toast({
          title: url.trim() ? "Processing Complete!" : "Example Loaded!",
          description: url.trim() 
            ? `Analysis finished in ${(response.metadata?.total_processing_time as string) || 'a few moments'}.`
            : "Example analysis loaded successfully to demonstrate capabilities.",
        });
      } else {
        throw new Error(response.message || 'An unknown processing error occurred');
      }
    } catch (error) {
      const apiError = handleApiError(error);
      setError(apiError);
      setCurrentStage("Failed");
      toast({
        title: url.trim() ? "Processing Failed" : "Example Loading Failed",
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
      <div className="relative overflow-hidden min-h-screen flex items-center bg-background">
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
                <span className="text-primary text-sm font-medium">Powered by Apify and Gemini</span>
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground fade-in-up stagger-1">
              YouTube
              <br />
              <span className="text-primary animate-glow bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Summarizer
              </span>
            </h1>
            
            <p className="text-xl sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed fade-in-up stagger-2">
              Transform any YouTube video into concise, intelligent summaries.{" "}
              <br className="hidden sm:block" />
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
      <div className="container mx-auto px-4 py-12 bg-background">
        <div className="max-w-4xl mx-auto space-y-8 bg-background">
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
          {!isLoading && !error && analysisResult && (
            <>
              {currentStage === "Completed" && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Processing completed successfully!</span>
                </div>
              )}
              
              {analysisResult.video_info && (
                 <VideoInfo
                    title={analysisResult.video_info.title}
                    author={analysisResult.video_info.author}
                    thumbnail={analysisResult.video_info.thumbnail}
                    duration={analysisResult.video_info.duration}
                    view_count={analysisResult.video_info.view_count}
                    like_count={analysisResult.video_info.like_count}
                    upload_date={analysisResult.video_info.upload_date}
                 />
              )}
              
              {analysisResult.analysis && (
                <AnalysisPanel analysis={analysisResult.analysis} />
              )}

              {analysisResult.transcript && (
                <TranscriptPanel transcript={analysisResult.transcript} />
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
      
      {/* Limitations Section */}
      <div className="bg-background border-t border-muted py-12 mt-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold text-foreground">Current Limitations</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-background/50 p-4 rounded-lg border border-muted">
                <h4 className="font-semibold text-foreground mb-2">API Quotas</h4>
                <p className="text-sm text-muted-foreground">
                  The Apify API has usage quotas. If exceeded, the system will fall back to Gemini, which may be slower.
                </p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg border border-muted">
                <h4 className="font-semibold text-foreground mb-2">Video Length</h4>
                <p className="text-sm text-muted-foreground">
                  Processing very long videos may time out or fail, especially with direct Gemini processing.
                </p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg border border-muted">
                <h4 className="font-semibold text-foreground mb-2">Content Accessibility</h4>
                <p className="text-sm text-muted-foreground">
                  Private or region-locked videos cannot be processed. Videos must be publicly accessible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-muted py-8 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Powered by Apify and Gemini
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
