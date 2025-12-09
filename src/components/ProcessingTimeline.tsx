import { ProcessLogs } from "@/components/ProcessLogs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isStepCompleted, isStepProcessing } from "@/lib/video-utils";
import { StreamingProcessingResult, StreamingProgressState } from "@/services/api";
import { CheckCircle } from "lucide-react";

interface ProcessingTimelineProps {
  progressStates: StreamingProgressState[];
  analysisResult?: StreamingProcessingResult;
  streamingLogs: string[];
  isExampleMode: boolean;
}

export function ProcessingTimeline({ 
  progressStates, 
  analysisResult, 
  streamingLogs,
  isExampleMode 
}: ProcessingTimelineProps) {
  if (progressStates.length === 0) return null;

  const hasStep = (step: StreamingProgressState['step']) =>
    progressStates.some(s => s.step === step);
  const finished = hasStep('complete');
  const completedIndex = finished
    ? 4
    : Math.max(
        0,
        [
          isStepCompleted(progressStates, 'scraping') ? 1 : 0,
          isStepCompleted(progressStates, 'analysis_generation') ? 2 : 0,
          isStepCompleted(progressStates, 'quality_check') ? 3 : 0,
        ].reduce((a, b) => Math.max(a, b), 0)
      );

  const activeIndex = (() => {
    if (finished) return 4;
    if (isStepProcessing(progressStates, 'quality_check')) return 3;
    if (isStepProcessing(progressStates, 'analysis_generation') || hasStep('analyzing')) return 2;
    if (!isStepCompleted(progressStates, 'scraping') && hasStep('scraping')) return 1;
    return completedIndex;
  })();

  const progressPercent = finished ? 100 : (activeIndex / 4) * 100;

  return (
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
        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="relative h-2 rounded-full timeline-track">
            <div
              className="timeline-fill transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Process Logs */}
        <ProcessLogs logs={streamingLogs} />
      </div>
    </Card>
  );
}

