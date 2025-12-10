import { Card } from "@/components/ui/card";
import { getStageText } from "@/lib/video-utils";
import { StreamingProgressState } from "@/services/types";
import { Loader2 } from "lucide-react";

interface ProcessingStatusProps {
  currentStage: string;
  currentStep: number;
  progressStates: StreamingProgressState[];
}

export function ProcessingStatus({ currentStage, currentStep, progressStates }: ProcessingStatusProps) {
  const hasStep = (step: StreamingProgressState['step']) =>
    progressStates.some(s => s.step === step);
  const finished = hasStep('complete');

  const mapCurrentToAnchor = (stepIdx: number): number => {
    if (stepIdx <= -1) return 0;
    if (stepIdx === 0) return 1;
    if (stepIdx === 1) return 2;
    if (stepIdx === 2) return 3;
    if (stepIdx === 3) return 2;
    if (stepIdx >= 4) return 4;
    return 2;
  };

  const activeAnchor = finished
    ? 4
    : (progressStates.length === 0 ? 0 : mapCurrentToAnchor(currentStep));

  const progressPercent = (activeAnchor / 4) * 100;
  const stageText = getStageText(activeAnchor);

  return (
    <Card className="p-8">
      <div className="space-y-8">
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <div className="absolute inset-0 w-20 h-20 bg-primary/30 rounded-full animate-ping" />
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-foreground">Processing Video</h3>
          <p className="text-lg text-muted-foreground">{currentStage}</p>
          
          <div className="space-y-3 mt-8">
            <div className="relative h-2 rounded-full timeline-track">
              <div
                className="timeline-fill transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Now: <span className="text-foreground font-semibold">{stageText}</span></span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

