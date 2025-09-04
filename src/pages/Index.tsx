import heroBackground from "@/assets/youtube-subtle-background.jpg";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VideoInfo } from "@/components/VideoInfo";
import { VideoUrlForm } from "@/components/VideoUrlForm";
import { useToast } from "@/hooks/use-toast";
import {
  ApiError,
  handleApiError,
  streamingProcessing,
  StreamingProcessingResult,
  StreamingProgressState,
  VideoInfoResponse,
} from "@/services/api";
import { exampleData } from "@/services/example-data";
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
    const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentStage, setCurrentStage] = useState<string>("");
  const [progressStates, setProgressStates] = useState<StreamingProgressState[]>([]);
  const [streamingLogs, setStreamingLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // Consolidated state for the response data
  const [analysisResult, setAnalysisResult] = useState<StreamingProcessingResult | null>(null);
  const [scrapedVideoInfo, setScrapedVideoInfo] = useState<VideoInfoResponse | null>(null);
  const [scrapedTranscript, setScrapedTranscript] = useState<string | null>(null);

  const { toast } = useToast();

  // Progress steps configuration (detailed workflow)
  const progressSteps = [
    { step: 'scraping', name: "Scraping Video", description: "Extracting video info and transcript using Apify" },
    { step: 'analysis_generation', name: "Analysis Generation", description: "Generating initial AI analysis with Gemini model" },
    { step: 'quality_check', name: "Quality Assessment", description: "Evaluating analysis quality and completeness" },
    { step: 'refinement', name: "Analysis Refinement", description: "Refining analysis based on quality feedback" },
    { step: 'complete', name: "Complete", description: "Analysis completed successfully" },
  ];





  const handleVideoSubmit = async (url: string, options?: {
    analysisModel?: string;
    qualityModel?: string;
    targetLanguage?: string;
  }) => {
    // Set loading state immediately
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setCurrentStep(0);
    setCurrentStage("Initializing...");
    setProgressStates([]);
    setStreamingLogs([]);
    setShowLogs(false);
    setScrapedVideoInfo(null);
    setScrapedTranscript(null);
    
    try {
      const finalUrl = url;
      
      // Use local example data if URL is empty
      if (!url.trim()) {
        setCurrentStage("Loading example...");
        
        // Create example progress states to show the Process Logs card
        const exampleProgressStates: StreamingProgressState[] = [
          {
            step: 'scraping',
            stepName: "Scraping Video",
            status: "completed",
            message: "Video scraped: The Trillion Dollar Equation",
            processingTime: "0.1s"
          },
          {
            step: 'analysis_generation',
            stepName: "Analysis Generation",
            status: "completed",
            message: "📝 Initial analysis generated with 3 chapters",
            iterationCount: 1
          },
          {
            step: 'quality_check',
            stepName: "Quality Assessment",
            status: "completed",
            message: "🎯 Quality check passed with 100% score - Analysis meets requirements",
            qualityScore: 100
          },
          {
            step: 'complete',
            stepName: "Analysis Complete",
            status: "completed",
            message: "✅ Analysis completed successfully with 100% quality score",
            processingTime: "0.2s",
            chunkCount: 5,
            iterationCount: 1,
            qualityScore: 100
          }
        ];
        
        setProgressStates(exampleProgressStates);
        
        // Simulate loading for example
        const exampleResult: StreamingProcessingResult = {
          success: true,
          videoInfo: exampleData.videoInfo,
          transcript: exampleData.transcript || '',
          analysis: exampleData.analysis || {
            title: 'Example Analysis',
            summary: 'This is example analysis data for demonstration purposes.',
            chapters: [],
            key_facts: [],
            takeaways: [],
            keywords: []
          },
          quality: {
            completeness: { rate: 'Pass', reason: 'Complete analysis provided' },
            structure: { rate: 'Pass', reason: 'Well structured' },
            grammar: { rate: 'Pass', reason: 'Good grammar' },
            no_garbage: { rate: 'Pass', reason: 'No promotional content' },
            useful_keywords: { rate: 'Pass', reason: 'Keywords are relevant and useful for highlighting key concepts' },
            correct_language: { rate: 'Pass', reason: 'Appropriate language' },
            total_score: 12,
            max_possible_score: 12,
            percentage_score: 100,
            is_acceptable: true
          },
          totalTime: '0.2s',
          iterationCount: 1,
          chunksProcessed: 5,
          logs: [
            '[10:00:00] 🚀 Starting AI analysis with Gemini model...',
            '[10:00:01] 📝 Initial analysis generated with 3 chapters',
            '[10:00:01] 🎯 Quality check passed with 100% score - Analysis meets requirements',
            '[10:00:02] ✅ Analysis completed successfully! Generated 3 chapters with 100% quality score',
            '[10:00:02] 🏁 Workflow completed successfully in 0.2s',
            '[10:00:02] Summary: 1 iterations processed',
            '[10:00:02] 📚 Generated 3 video chapters',
            '[10:00:02] 🌟 Final quality score: 100%'
          ]
        };
        setScrapedVideoInfo(exampleResult.videoInfo || null);
        setAnalysisResult(exampleResult);

        setCurrentStep(4);
        setCurrentStage("Example ready");
        setIsLoading(false);
        
        // Removed success toast notification
        return;
      }

            // Streaming processing workflow (logs collected internally)
      setCurrentStage("Starting processing...");

      const result = await streamingProcessing(
        finalUrl,
        (progressState: StreamingProgressState) => {
          console.log('Progress update:', progressState);

          // Update current step and stage
          const stepIndex = progressSteps.findIndex(s => s.step === progressState.step);
          setCurrentStep(stepIndex >= 0 ? stepIndex : 0);
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

            return updated.sort((a, b) => {
              const order = ['scraping', 'analysis_generation', 'quality_check', 'refinement', 'complete'];
              return order.indexOf(a.step) - order.indexOf(b.step);
            });
          });

          // If scraping completed, surface video info immediately
          if (progressState.step === 'scraping' && progressState.status === 'completed') {
            type ScrapeDataPayload = { videoInfo?: VideoInfoResponse; transcript?: string };
            const data = (progressState as unknown as { data?: ScrapeDataPayload }).data;
            if (data && data.videoInfo) {
              setScrapedVideoInfo(data.videoInfo as VideoInfoResponse);
            }
            if (data && typeof data.transcript === 'string') {
              setScrapedTranscript(data.transcript);
            }
          }
        },
        (logs: string[]) => {
          // Update streaming logs
          setStreamingLogs(logs);
        },
        options ? {
          analysisModel: options.analysisModel,
          qualityModel: options.qualityModel,
          targetLanguage: options.targetLanguage,
        } : undefined
      );

      if (result.success) {
        console.log('🎉 Streaming completed successfully:', {
          hasVideoInfo: !!result.videoInfo,
          hasTranscript: !!result.transcript,
          hasAnalysis: !!result.analysis,
          hasQuality: !!result.quality,
          analysisChapters: result.analysis?.chapters?.length || 0,
          qualityScore: result.quality?.percentage_score || 0
        });

        setScrapedVideoInfo(result.videoInfo || scrapedVideoInfo);
        setScrapedTranscript(result.transcript || scrapedTranscript);
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
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
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
        
        <div className="relative container mx-auto px-4 pt-4 pb-20">
          <div className="text-center space-y-4 mb-8">
            <div className="fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-primary text-base font-medium">Powered by Gemini, Apify, Fal</span>
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground fade-in-up stagger-1">
              YouTube
              <br />
              <span className="animate-glow bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Summarizer
              </span>
            </h1>
            
            <p className="text-xl sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed fade-in-up stagger-2">
              Transform any 
              <span className="text-primary font-semibold"> YouTube </span>
               video into structured summaries.{" "}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-base text-muted-foreground fade-in-up stagger-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>Scrap / Transcribe + Summarize</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>Structured Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>Time Saving</span>
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
          {/* Show Video Info as soon as scraping completes, even while loading */}
          {(scrapedVideoInfo || (analysisResult && analysisResult.videoInfo)) && (
            <VideoInfo
              url={(analysisResult?.videoInfo || scrapedVideoInfo)!.url}
              title={(analysisResult?.videoInfo || scrapedVideoInfo)!.title}
              thumbnail={(analysisResult?.videoInfo || scrapedVideoInfo)!.thumbnail}
              author={(analysisResult?.videoInfo || scrapedVideoInfo)!.author}
              duration={(analysisResult?.videoInfo || scrapedVideoInfo)!.duration}
              upload_date={(analysisResult?.videoInfo || scrapedVideoInfo)!.upload_date}
              view_count={(analysisResult?.videoInfo || scrapedVideoInfo)!.view_count}
              like_count={(analysisResult?.videoInfo || scrapedVideoInfo)!.like_count}
            />
          )}

          {/* Show Transcript as soon as it's scraped, even while analysis continues */}
          {(scrapedTranscript || (analysisResult && analysisResult.transcript)) && (
            <TranscriptPanel transcript={(analysisResult?.transcript || scrapedTranscript) as string} />
          )}

          {/* Show AI Analysis after transcript when available */}
          {analysisResult?.analysis && (
            <AnalysisPanel
              analysis={analysisResult.analysis}
              quality={analysisResult.quality}
              videoUrl={analysisResult.videoInfo?.url}
            />
          )}

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
                  
                  {/* Streaming Steps */}
                  <div className="space-y-4 mt-8">
                    {progressSteps.map((step, index) => {
                      const stepState = progressStates.find(s => s.step === step.step);
                      const isActive = index === currentStep;
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
                              <span className="text-white text-base font-bold">{index + 1}</span>
                            )}
                          </div>

                          <div className="flex-1 text-left">
                            <h4 className="font-semibold text-foreground">{step.name}</h4>
                            <p className="text-base text-muted-foreground">
                              {stepState?.message || step.description}
                            </p>
                            {stepState?.processingTime && (
                              <div className="flex justify-end mt-2">
                                <span className="text-xs font-medium text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                                  {stepState.processingTime}
                                </span>
                              </div>
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
                      style={{width: `${(currentStep / 4) * 100}%`}}
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
                  <div className="flex items-center gap-4 mb-3 text-base">
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
                      <p className="text-base text-muted-foreground mb-1">Technical Details:</p>
                      <p className="text-xs font-mono text-foreground break-all">{error.details}</p>
                    </div>
                  )}
                  
                  {/* Show progress details if available */}
                  {progressStates.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-semibold text-base">Progress Details:</h4>
                      <div className="bg-muted/30 rounded-lg p-4 max-h-48 overflow-y-auto">
                        {progressStates.map((state, index) => (
                          <div key={index} className="text-base text-foreground font-mono mb-2">
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
                      <p className="text-base text-blue-800">
                        <strong>Configuration Issue:</strong> The Apify API key is not configured on the backend server. 
                        Please contact the administrator to configure the required API keys.
                      </p>
                    </div>
                  )}
                  
                  {error.message.includes('GEMINI_API_KEY') && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-base text-blue-800">
                        <strong>Configuration Issue:</strong> The Gemini API key is not configured on the backend server. 
                        Please contact the administrator to configure the required API keys.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Success State (post-processing UI blocks, excludes Analysis/Transcript to avoid duplicates) */}
          {!isLoading && !error && analysisResult && analysisResult.success && (
            <>
              {/* Process Logs (with optional nested real-time Logs) */}
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
                    {analysisResult?.totalTime && (
                      <div className="ml-auto">
                        <span className="text-sm font-medium text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                          Total: {analysisResult.totalTime}
                        </span>
                      </div>
                    )}
                  </Button>
                  <div className="px-6 pb-6 pt-0 space-y-4">
                    {progressStates.map((state, index) => (
                      <div key={index} className="bg-muted/20 rounded-lg p-4 border border-muted/30">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-semibold text-foreground">{state.stepName}</span>
                        </div>
                        <p className="text-base text-muted-foreground mb-2">{state.message}</p>
                        {state.processingTime && (
                          <div className="flex justify-end">
                            <span className="text-base font-medium text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                              {state.processingTime}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Nested Logs inside Process Logs */}
                    {streamingLogs.length > 0 && (
                      <>
                        <div className="mt-2 border-t border-muted/30" />
                        <Button
                          variant="ghost"
                          className="w-full p-6 h-auto justify-between hover:bg-primary/5 transition-all duration-300"
                          onClick={() => setShowLogs(!showLogs)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-left">
                              <span className="text-2xl font-bold text-foreground block">Logs</span>
                              <span className="text-muted-foreground">Real-time processing updates and quality checks ({streamingLogs.length} entries)</span>
                            </div>
                          </div>
                          {showLogs ? (
                            <ChevronUp className="w-6 h-6 text-primary" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-primary" />
                          )}
                        </Button>
                        {showLogs && (
                          <div className="px-2 pb-2 pt-0 space-y-4">
                            <div className="bg-muted/20 rounded-lg p-4 border border-muted/30 max-h-96 overflow-y-auto">
                              <div className="space-y-2 font-mono text-sm text-left">
                                {streamingLogs.map((log, index) => (
                                  <div key={index} className="text-foreground">
                                    {log}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
