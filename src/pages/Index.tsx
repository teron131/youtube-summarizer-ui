import heroBackground from "@/assets/youtube-subtle-background.jpg";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VideoInfo } from "@/components/VideoInfo";
import { VideoUrlForm } from "@/components/VideoUrlForm";
import { useToast } from "@/hooks/use-toast";
import {
  ApiError,
  handleApiError,
  twoStepProcessing,
  TwoStepProcessingResult,
  TwoStepProgressState,
} from "@/services/api";
import { exampleData } from "@/services/example-data";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentStage, setCurrentStage] = useState<string>("");
  const [progressStates, setProgressStates] = useState<TwoStepProgressState[]>([]);
  
  // Consolidated state for the response data
  const [analysisResult, setAnalysisResult] = useState<TwoStepProcessingResult | null>(null);

  const { toast } = useToast();

  // Progress steps configuration (2 steps)
  const progressSteps = [
    { step: 1, name: "Scraping Video", description: "Extracting video info and transcript using Apify" },
    { step: 2, name: "AI Analysis", description: "Generating AI summary and analysis using Gemini" },
  ];

  const handleVideoSubmit = async (url: string) => {
    // Set loading state immediately
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setCurrentStep(0);
    setCurrentStage("Initializing...");
    setProgressStates([]);
    
    try {
      const finalUrl = url;
      
      // Use local example data if URL is empty
      if (!url.trim()) {
        setCurrentStage("Loading example...");
        
        // Create example progress states to show the Process Logs card
        const exampleProgressStates: TwoStepProgressState[] = [
          {
            step: 1,
            stepName: "Scraping Video",
            status: "completed",
            message: "Video scraped: The Trillion Dollar Equation",
            processingTime: "0.1s"
          },
          {
            step: 2,
            stepName: "AI Analysis",
            status: "completed",
            message: "Analysis completed successfully",
            processingTime: "0.1s"
          }
        ];
        
        setProgressStates(exampleProgressStates);
        
        // Simulate loading for example
        const exampleResult: TwoStepProcessingResult = {
          success: true,
          videoInfo: exampleData.videoInfo,
          transcript: exampleData.transcript || '',
          analysis: exampleData.analysis || {
            title: 'Example Analysis',
            overall_summary: 'This is example analysis data for demonstration purposes.',
            chapters: [],
            key_facts: [],
            takeaways: []
          },
          totalTime: '0.2s'
        };
        
        setAnalysisResult(exampleResult);
        setCurrentStep(2);
        setCurrentStage("Example ready");
        setIsLoading(false);
        
        // Removed success toast notification
        return;
      }

      // Two-step progressive processing workflow
      setCurrentStage("Starting processing...");
      
      const result = await twoStepProcessing(
        finalUrl,
        (progressState: TwoStepProgressState) => {
          console.log('Progress update:', progressState);
          
          // Update current step and stage
          setCurrentStep(progressState.step);
          setCurrentStage(progressState.message);
          
          // Update progress states array
          setProgressStates(prev => {
            const updated = [...prev];
            const existingIndex = updated.findIndex(s => s.step === progressState.step);
            
            if (existingIndex >= 0) {
              updated[existingIndex] = progressState;
            } else {
              updated.push(progressState);
            }
            
            return updated.sort((a, b) => a.step - b.step);
          });
        }
      );

      if (result.success) {
        setAnalysisResult(result);
        setCurrentStage("Processing completed");
        
        // Removed success toast notification
      } else {
        throw result.error || new Error('Processing failed');
      }
      
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
              <span className="text-primary font-semibold">2-step processing</span> with 
              <span className="text-primary font-semibold"> real-time feedback</span> for better reliability.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground fade-in-up stagger-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>Scrap + Summarize</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>Real-time Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>Better Reliability</span>
              </div>
            </div>
          </div>
          
          <div className="max-w-5xl mx-auto fade-in-up stagger-4">
            <VideoUrlForm onSubmit={handleVideoSubmit} isLoading={isLoading} />
          </div>
        </div>
      </div>

      {/* Results and Status Section */}
      <div className="container mx-auto px-4 py-12 bg-background">
        <div className="max-w-5xl mx-auto space-y-8 bg-background">
          {/* Progressive Loading State */}
          {isLoading && (
            <Card className="p-8 modern-blur shadow-glass">
              <div className="space-y-8">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    </div>
                    <div className="absolute inset-0 w-20 h-20 bg-primary/30 rounded-full animate-ping"></div>
                  </div>
                </div>
                
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold text-foreground">Processing Video</h3>
                  <p className="text-lg text-muted-foreground">{currentStage}</p>
                  
                  {/* Simplified Steps */}
                  <div className="space-y-4 mt-8">
                    {progressSteps.map((step, index) => {
                      const stepState = progressStates.find(s => s.step === step.step);
                      const isActive = currentStep === step.step;
                      const isCompleted = stepState?.status === 'completed';
                      const isError = stepState?.status === 'error';
                      
                      return (
                        <div key={step.step} className="flex items-center gap-4 p-4 rounded-lg bg-muted/20 border border-muted/30">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-green-500' : 
                            isError ? 'bg-red-500' :
                            isActive ? 'bg-primary animate-pulse' : 
                            'bg-muted'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : isError ? (
                              <AlertCircle className="w-5 h-5 text-white" />
                            ) : isActive ? (
                              <Loader2 className="w-5 h-5 text-white animate-spin" />
                            ) : (
                              <span className="text-white text-sm font-bold">{step.step}</span>
                            )}
                          </div>
                          
                          <div className="flex-1 text-left">
                            <h4 className="font-semibold text-foreground">{step.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {stepState?.message || step.description}
                            </p>
                            {stepState?.processingTime && (
                              <span className="text-xs text-red-500">
                                {stepState.processingTime}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Overall Progress Bar */}
                  <div className="w-full bg-muted/30 rounded-full h-3 mt-6">
                    <div 
                      className="bg-gradient-primary h-3 rounded-full transition-all duration-500 ease-out"
                      style={{width: `${(currentStep / 2) * 100}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Card className="p-6 bg-gradient-card border border-destructive shadow-card backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-destructive mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-destructive mb-2">{error.message}</h3>
                  
                  {/* Show error type and status */}
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    {error.type && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        error.type === 'server' ? 'bg-red-100 text-red-800' :
                        error.type === 'validation' ? 'bg-yellow-100 text-yellow-800' :
                        error.type === 'network' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {error.type.toUpperCase()}
                      </span>
                    )}
                    {error.status && (
                      <span className="text-muted-foreground">
                        Status: {error.status}
                      </span>
                    )}
                  </div>
                  
                  {/* Show error details if available */}
                  {error.details && (
                    <div className="bg-muted/30 rounded-lg p-3 mb-3">
                      <p className="text-sm text-muted-foreground mb-1">Technical Details:</p>
                      <p className="text-xs font-mono text-foreground break-all">{error.details}</p>
                    </div>
                  )}
                  
                  {/* Show progress details if available */}
                  {progressStates.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-semibold text-sm">Progress Details:</h4>
                      <div className="bg-muted/30 rounded-lg p-4 max-h-48 overflow-y-auto">
                        {progressStates.map((state, index) => (
                          <div key={index} className="text-sm text-foreground font-mono mb-2">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              state.status === 'completed' ? 'bg-green-500' :
                              state.status === 'error' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`}></span>
                            Step {state.step}: {state.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Show helpful suggestions for common errors */}
                  {error.message.includes('APIFY_API_KEY') && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Configuration Issue:</strong> The Apify API key is not configured on the backend server. 
                        Please contact the administrator to configure the required API keys.
                      </p>
                    </div>
                  )}
                  
                  {error.message.includes('GEMINI_API_KEY') && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Configuration Issue:</strong> The Gemini API key is not configured on the backend server. 
                        Please contact the administrator to configure the required API keys.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Success State */}
          {!isLoading && !error && analysisResult && analysisResult.success && (
            <>
              
              {analysisResult.videoInfo && (
                <VideoInfo
                  title={analysisResult.videoInfo.title}
                  author={analysisResult.videoInfo.author}
                  thumbnail={analysisResult.videoInfo.thumbnail}
                  duration={analysisResult.videoInfo.duration}
                  view_count={analysisResult.videoInfo.view_count}
                  like_count={analysisResult.videoInfo.like_count}
                  upload_date={analysisResult.videoInfo.upload_date}
                />
              )}
              
              {analysisResult.analysis && (
                <AnalysisPanel analysis={analysisResult.analysis} />
              )}

              {analysisResult.transcript && (
                <TranscriptPanel transcript={analysisResult.transcript} />
              )}

                    {/* Process Logs */}
      {progressStates.length > 0 && (
        <Card className="bg-gradient-card border border-red-500/30 shadow-card backdrop-blur-sm">
          <Button
            variant="ghost"
            className="w-full p-8 h-auto justify-between hover:bg-primary/5 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold text-foreground block">Process Logs</span>
                <span className="text-muted-foreground">Processing steps and timing</span>
              </div>
            </div>
          </Button>
          <div className="px-6 pb-6 pt-0 space-y-4">
            {progressStates.map((state, index) => (
              <div key={index} className="bg-muted/20 rounded-lg p-4 border border-muted/30">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-foreground">{state.stepName}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{state.message}</p>
                {state.processingTime && (
                  <div className="flex justify-end">
                    <span className="text-sm font-medium text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                      {state.processingTime}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
            </>
          )}
        </div>
      </div>
      
      {/* Processing Benefits Section */}
      <div className="bg-background border-t border-muted py-12 mt-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold text-foreground">Processing Benefits</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-background/50 p-4 rounded-lg border border-muted">
                <h4 className="font-semibold text-foreground mb-2">2-Step Process</h4>
                <p className="text-sm text-muted-foreground">
                  Just scrap the video data and then generate AI analysis - simple and efficient.
                </p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg border border-muted">
                <h4 className="font-semibold text-foreground mb-2">Real-time Feedback</h4>
                <p className="text-sm text-muted-foreground">
                  See exactly which step is being processed and get immediate feedback on progress.
                </p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg border border-muted">
                <h4 className="font-semibold text-foreground mb-2">Better Reliability</h4>
                <p className="text-sm text-muted-foreground">
                  Uses existing proven functions directly - scrap_youtube() and summarize_video().
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
