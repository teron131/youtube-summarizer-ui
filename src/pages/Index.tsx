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
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

const Index = () => {
  // Read video ID parameter directly on initialization
  const getInitialUrlFromParams = (): string => {
    try {
      const params = new URLSearchParams(window.location.search);
      const videoId = params.get('v');
      
      // Validate video ID format (YouTube video IDs are typically 11 characters)
      if (videoId && /^[\w-]{11}$/.test(videoId)) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
    }
    
    return "";
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [initialUrl] = useState<string>(getInitialUrlFromParams());
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentStage, setCurrentStage] = useState<string>("");
  const [progressStates, setProgressStates] = useState<StreamingProgressState[]>([]);
  const [streamingLogs, setStreamingLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [isExampleMode, setIsExampleMode] = useState(false);

  // Consolidated state for the response data
  const [analysisResult, setAnalysisResult] = useState<StreamingProcessingResult | null>(null);
  const [scrapedVideoInfo, setScrapedVideoInfo] = useState<VideoInfoResponse | null>(null);
  const [scrapedTranscript, setScrapedTranscript] = useState<string | null>(null);

  const { toast } = useToast();

  // Progress steps configuration (detailed workflow)
  const progressSteps = [
    { step: 'scraping', name: "Scraping Video", description: "Extracting video info and transcript using Scrape Creators" },
    { step: 'analysis_generation', name: "Analysis Generation", description: "Generating initial AI analysis with Gemini model" },
    { step: 'quality_check', name: "Quality Assessment", description: "Evaluating analysis quality and completeness" },
    { step: 'refinement', name: "Analysis Refinement", description: "Refining analysis based on quality feedback" },
    { step: 'complete', name: "Complete", description: "Analysis completed successfully" },
  ];

  // Helper: load example data into UI (used for empty URL or error fallback)
  const loadExampleData = () => {
    setIsExampleMode(false); // Don't set to true so results will display
    setCurrentStage("Loading example...");

    // Create realistic progress states based on the actual example data
    const exampleProgressStates: StreamingProgressState[] = [
      {
        step: 'scraping',
        stepName: "Scraping Video",
        status: "completed",
        message: `Video scraped: ${exampleData.videoInfo.title}`,
        processingTime: "0.1s"
      },
      {
        step: 'analysis_generation',
        stepName: "Analysis Generation",
        status: "completed",
        message: `📝 Initial analysis generated with ${exampleData.analysis?.chapters?.length || 0} chapters`,
        iterationCount: exampleData.iterationCount
      },
      {
        step: 'quality_check',
        stepName: "Quality Assessment",
        status: "completed",
        message: exampleData.quality?.percentage_score
          ? `🎯 Quality check passed with ${exampleData.quality.percentage_score}% score - Analysis meets requirements`
          : `🎯 Quality check passed - Analysis meets requirements`,
        qualityScore: exampleData.quality?.percentage_score || 100
      },
      {
        step: 'complete',
        stepName: "Analysis Complete",
        status: "completed",
        message: exampleData.quality?.percentage_score
          ? `✅ Analysis completed successfully with ${exampleData.quality.percentage_score}% quality score`
          : `✅ Analysis completed successfully`,
        processingTime: exampleData.totalTime,
        chunkCount: exampleData.chunksProcessed,
        iterationCount: exampleData.iterationCount,
        qualityScore: exampleData.quality?.percentage_score || 100
      }
    ];

    setProgressStates(exampleProgressStates);

    // Use the actual imported example data
    setScrapedVideoInfo(exampleData.videoInfo || null);
    setScrapedTranscript(exampleData.transcript || null);
    setAnalysisResult(exampleData);
    setStreamingLogs(exampleData.logs || []);
    setCurrentStep(4);
    setCurrentStage("Example ready");
    setIsLoading(false);

  };

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
    setIsExampleMode(false);
    
    try {
      const finalUrl = url;
      
      // Use local example data if URL is empty
      if (!url.trim()) {
        loadExampleData();
        return;
      }

            // Streaming processing workflow (logs collected internally)
      setCurrentStage("Starting processing...");

      const result = await streamingProcessing(
        finalUrl,
        (progressState: StreamingProgressState) => {
          // Silent update; avoid noisy logs in production UI

          // Update current step and stage
          // Normalize transient step names so UI doesn't flicker between states
          const normalizedStep: StreamingProgressState['step'] = progressState.step === 'analyzing'
            ? 'analysis_generation'
            : progressState.step;

          const stepIndex = progressSteps.findIndex(s => s.step === normalizedStep);
          setCurrentStep(stepIndex >= 0 ? stepIndex : 0);
          setCurrentStage(progressState.message);

          // Update progress states array
          setProgressStates(prev => {
            const updated = [...prev];
            const existingIndex = updated.findIndex(s => s.step === normalizedStep);

            if (existingIndex >= 0) {
              updated[existingIndex] = { ...progressState, step: normalizedStep };
            } else {
              updated.push({ ...progressState, step: normalizedStep });
            }

            return updated.sort((a, b) => {
              const order = ['scraping', 'analysis_generation', 'quality_check', 'refinement', 'complete'];
              return order.indexOf(a.step) - order.indexOf(b.step);
            });
          });

          // If scraping completed, surface video info immediately
          if (normalizedStep === 'scraping' && progressState.status === 'completed') {
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

      // Defensive check for result object
      if (!result) {
        throw new Error('Processing failed: No result returned from streaming processing');
      }

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
                <span className="text-primary text-base font-medium">Powered by Gemini, Scrape Creators, Fal</span>
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
            <VideoUrlForm onSubmit={handleVideoSubmit} isLoading={isLoading} initialUrl={initialUrl} />
          </div>
        </div>
      </div>

      {/* Results and Status Section */}
      <div className="container mx-auto px-4 py-12 bg-background">
        <div className="max-w-5xl mx-auto space-y-8 bg-background">
          {/* Show Video Info as soon as scraping completes, even while loading */}
          {!isExampleMode && (scrapedVideoInfo || (analysisResult && analysisResult.videoInfo)) && (
            (() => {
              const videoInfo = analysisResult?.videoInfo || scrapedVideoInfo;
              return (
                <VideoInfo
                  url={videoInfo?.url}
                  title={videoInfo?.title}
                  thumbnail={videoInfo?.thumbnail}
                  author={videoInfo?.author}
                  duration={videoInfo?.duration}
                  upload_date={videoInfo?.upload_date}
                  view_count={videoInfo?.view_count}
                  like_count={videoInfo?.like_count}
                />
              );
            })()
          )}

          {/* Show Transcript as soon as it's scraped, even while analysis continues */}
          {!isExampleMode && (scrapedTranscript || (analysisResult && analysisResult.transcript)) && (
            <TranscriptPanel transcript={(analysisResult?.transcript || scrapedTranscript) as string} />
          )}

          {/* Show AI Analysis after transcript when available */}
          {!isExampleMode && analysisResult?.analysis && (
            <AnalysisPanel
              analysis={analysisResult.analysis}
              quality={analysisResult.quality}
              videoInfo={analysisResult.videoInfo}
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
                  
                  {/* Glowing horizontal timeline (no numbered nodes) */}
                  {(() => {
                    // Stage anchors: 0 Start, 1 Scrap, 2 Analysis, 3 Quality, 4 Finish
                    const has = (step: StreamingProgressState['step']) => progressStates.some(s => s.step === step);
                    const finished = has('complete');

                    // Map currentStep (0..4 from progressSteps) to anchor index
                    const mapCurrentToAnchor = (stepIdx: number): number => {
                      if (stepIdx <= -1) return 0;       // Start
                      if (stepIdx === 0) return 1;       // Scraping
                      if (stepIdx === 1) return 2;       // Analysis generation
                      if (stepIdx === 2) return 3;       // Quality check
                      if (stepIdx === 3) return 2;       // Refinement -> Quality side
                      if (stepIdx >= 4) return 4;        // Complete -> 100% (changed from === to >=)
                      return 2;                          // Default -> Analysis side
                    };

                    const activeAnchor = finished
                      ? 4
                      : (progressStates.length === 0 ? 0 : mapCurrentToAnchor(currentStep));

                    const progressPercent = (activeAnchor / 4) * 100;
                    const stageText = ['Start', 'Scrap', 'Analysis', 'Quality', 'Finish'][activeAnchor] || 'Processing';


                    return (
                      <div className="space-y-3 mt-8">
                        <div className="relative h-2 rounded-full timeline-track">
                          <div
                            className="timeline-fill transition-all duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          <span>Now: <span className="text-foreground font-semibold">{stageText}</span></span>
                        </div>
                      </div>
                    );
                  })()}
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
                  {error.message.includes('SCRAPECREATORS_API_KEY') && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-base text-blue-800">
                        <strong>Configuration Issue:</strong> The Scrape Creators API key is not configured on the backend server. 
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

                  {/* Fallback: Use example data */}
                  <div className="mt-4 flex gap-3">
                    <Button onClick={loadExampleData} className="bg-primary text-white">
                      Load example data
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Success State (post-processing UI blocks, excludes Analysis/Transcript to avoid duplicates) */}
          {!isLoading && !error && analysisResult && analysisResult.success && (
            <>
              {/* Simple Horizontal Timeline + Terminal Logs */}
              {progressStates.length > 0 && (
                <Card className="bg-gradient-card border border-red-500/30 shadow-card backdrop-blur-sm">
                  <Button
                    variant="ghost"
                    className="w-full p-8 h-auto justify-between hover:bg-primary/5 transition-all duration-300 whitespace-normal items-start text-left"
                  >
                     <div className="flex items-center gap-4 min-w-0 flex-1">
                       <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                         <CheckCircle className="w-6 h-6 text-white" />
                       </div>
                       <div className="text-left min-w-0 flex-1">
                         <span className="text-lg sm:text-2xl font-bold text-foreground block break-words">Process Overview</span>
                         <span className="text-sm sm:text-base text-muted-foreground block break-words">
                           {analysisResult?.iterationCount
                             ? `${analysisResult.iterationCount} iteration${analysisResult.iterationCount > 1 ? 's' : ''} completed`
                             : 'Processing steps and timing'
                           }
                         </span>
                       </div>
                     </div>
                    {!isExampleMode && analysisResult?.totalTime && (
                      <div className="ml-auto">
                        <span className="text-sm font-medium text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                          Total: {analysisResult.totalTime}
                        </span>
                      </div>
                    )}
                  </Button>
                  <div className="px-6 pb-6 pt-0 space-y-6">
                    {/* Simple Horizontal Timeline */}
                    {(() => {
                      const stages = [
                        { key: 'start', label: 'Start' },
                        { key: 'scraping', label: 'Scrap' },
                        { key: 'analysis_generation', label: 'Analysis' },
                        { key: 'quality_check', label: 'Quality' },
                        { key: 'finish', label: 'Finish' },
                      ];

                      const has = (step: StreamingProgressState['step']) => progressStates.some(s => s.step === step);
                      const isCompleted = (step: StreamingProgressState['step']) => progressStates.some(s => s.step === step && s.status === 'completed');
                      const isProcessing = (step: StreamingProgressState['step']) => progressStates.some(s => s.step === step && s.status === 'processing');

                      const finished = has('complete');
                      const completedIndex = finished
                        ? 4
                        : Math.max(
                            0,
                            [
                              isCompleted('scraping') ? 1 : 0,
                              isCompleted('analysis_generation') ? 2 : 0,
                              isCompleted('quality_check') ? 3 : 0,
                            ].reduce((a, b) => Math.max(a, b), 0)
                          );

                      const activeIndex = (() => {
                        if (finished) return 4;
                        if (isProcessing('quality_check')) return 3;
                        if (isProcessing('analysis_generation') || has('analyzing')) return 2;
                        if (!isCompleted('scraping') && has('scraping')) return 1;
                        return completedIndex;
                      })();

                      // After finishing, show full bar
                      const progressPercent = finished ? 100 : (activeIndex / 4) * 100;

                      return (
                        <div className="space-y-4">
                          {/* Progress Bar with glow */}
                          <div className="relative h-2 rounded-full timeline-track">
                            <div
                              className="timeline-fill transition-all duration-500 ease-out"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {/* Nested Logs inside Process Logs */}
                    {streamingLogs.length > 0 && (
                      <>
                        <div className="mt-2 border-t border-muted/30" />
                        <Button
                          variant="ghost"
                          className="w-full p-6 h-auto justify-between hover:bg-primary/5 transition-all duration-300 whitespace-normal items-start text-left"
                          onClick={() => setShowLogs(!showLogs)}
                        >
                           <div className="flex items-center gap-4 min-w-0 flex-1">
                             <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                               <FileText className="w-5 h-5 text-white" />
                             </div>
                             <div className="text-left min-w-0 flex-1">
                               <span className="text-lg sm:text-xl font-bold text-foreground block break-words">Real-time Logs</span>
                               <span className="text-sm sm:text-base text-muted-foreground block break-words">
                                 Live processing updates with iteration details ({streamingLogs.length} entries)
                               </span>
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
                               <div className="space-y-1 font-mono text-xs text-left">
                                 {streamingLogs.map((log, index) => {
                                   const isIterationLog = log.includes('iteration') || log.includes('Iteration');
                                   const isQualityLog = log.includes('quality') || log.includes('Quality');
                                   const isErrorLog = log.includes('❌') || log.includes('failed');
                                   const isSuccessLog = log.includes('✅') || log.includes('completed');

                                   let logClass = "text-foreground";
                                   if (isErrorLog) logClass = "text-red-400";
                                   else if (isSuccessLog) logClass = "text-green-400";
                                   else if (isQualityLog) logClass = "text-blue-400";
                                   else if (isIterationLog) logClass = "text-purple-400 font-semibold";

                                   return (
                                     <div key={index} className={`${logClass} leading-relaxed break-words whitespace-pre-wrap`}>
                                       {log}
                                     </div>
                                   );
                                 })}
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
