import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BadgeList, BulletList, Checklist, SectionHeader } from "@/components/ui/list-items";
import { useToast } from "@/hooks/use-toast";
import { generateAnalysisMarkdown } from "@/lib/markdown-utils";
import { convertAnalysisChinese } from "@/lib/utils";
import { AnalysisData, QualityData, VideoInfoResponse } from "@/services/types";
import { BookOpen, Copy, Lightbulb, ListChecks, Sparkles } from "lucide-react";

interface AnalysisPanelProps {
  analysis: AnalysisData;
  quality?: QualityData;
  videoInfo?: VideoInfoResponse;
}

export const AnalysisPanel = ({ analysis, quality, videoInfo }: AnalysisPanelProps) => {
  const { toast } = useToast();

  if (!analysis) {
    return null;
  }

  // Convert Chinese characters in analysis results before displaying
  const convertedAnalysis = convertAnalysisChinese(analysis);


  const copyToClipboard = async () => {
    try {
      const markdown = generateAnalysisMarkdown(analysis, videoInfo);
      await navigator.clipboard.writeText(markdown);
      toast({
        title: "Copied!",
        description: "Video info and analysis copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy analysis",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-0 shadow-md">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-primary/5" />

      <div className="relative space-y-5 md:space-y-6 p-6 md:p-8">
        {/* Main Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <ListChecks className="h-4 w-4" />
              AI Analysis
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">Structured Analysis</h3>
            <p className="text-sm text-muted-foreground">Save time on long videos, and keywords in one view.</p>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={copyToClipboard}
            className="gap-3 h-11 px-4 border-border/60 text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            <Copy className="w-5 h-5" />
          </Button>
        </div>

        {/* Summary Section */}
        {convertedAnalysis.summary && (
          <div className="space-y-3">
            <SectionHeader icon={<Sparkles className="w-4 h-4 md:w-5 md:h-5" />} title="Summary" />
            <p className="text-foreground leading-7 md:leading-8 text-sm md:text-base">
              {convertedAnalysis.summary}
            </p>
          </div>
        )}

        {/* Key Takeaways Section */}
        {convertedAnalysis.takeaways && convertedAnalysis.takeaways.length > 0 && (
          <div className="space-y-3">
            <SectionHeader icon={<Lightbulb className="w-4 h-4 md:w-5 md:h-5" />} title="Key Takeaways" />
            <Checklist items={convertedAnalysis.takeaways} />
          </div>
        )}

        {/* Video Chapters Section */}
        {convertedAnalysis.chapters && convertedAnalysis.chapters.length > 0 && (
          <div className="space-y-3">
            <SectionHeader icon={<BookOpen className="w-4 h-4 md:w-5 md:h-5" />} title="Video Chapters" />

            <div className="space-y-3">
              {convertedAnalysis.chapters.map((chapter, index) => {
                const isLast = index === convertedAnalysis.chapters.length - 1;
                return (
                  <div key={index} className="grid grid-cols-[auto_1fr] gap-3">
                    <div className="relative flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary font-semibold">
                        {index + 1}
                      </div>
                      <div
                        className={`mt-0 w-px bg-gradient-to-b from-primary/60 via-primary/50 to-transparent ${
                          isLast ? "h-[98%]" : "h-full"
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <h5 className="text-base md:text-lg font-semibold text-primary">{chapter.header}</h5>
                      <p className="text-foreground leading-7 md:leading-8 text-sm md:text-base">{chapter.summary}</p>

                      {chapter.key_points && chapter.key_points.length > 0 && (
                        <BulletList items={chapter.key_points} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Keywords Section */}
        {convertedAnalysis.keywords && convertedAnalysis.keywords.length > 0 && (
          <div className="space-y-3">
            <SectionHeader icon={<span className="text-sm md:text-base font-bold text-primary">#</span>} title="Keywords" />
            <BadgeList items={convertedAnalysis.keywords} />
          </div>
        )}
      </div>
    </Card>
  );
};
