import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

// Helper function to render text
const renderText = (text: string, className = "") => (
  <span className={`text-foreground leading-7 md:leading-8 text-sm md:text-base ${className}`}>
    {text}
  </span>
);

// Helper component for section headers
interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
}

const SectionHeader = ({ icon, title }: SectionHeaderProps) => (
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
      {icon}
    </div>
    <h4 className="text-base md:text-lg font-bold text-primary">{title}</h4>
  </div>
);

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
    <Card className="p-4 md:p-6 modern-blur shadow-glass hover-lift">
      <div className="space-y-3 md:space-y-4">
        {/* Main Header - now inside the card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <ListChecks className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">AI Analysis</h3>
              <p className="text-muted-foreground">Key insights extracted from the video content.</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="lg"
            onClick={copyToClipboard}
            className="gap-3 h-12 px-6 border-primary/30 hover:bg-primary/10 hover:border-primary transition-all duration-300"
          >
            <Copy className="w-5 h-5" />
            Copy
          </Button>
        </div>

        {/* Summary Section */}
        {convertedAnalysis.summary && (
          <div className="space-y-1.5 md:space-y-2">
            <SectionHeader icon={<Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />} title="Summary" />
            <div className="pl-2 md:pl-3">
              <p className="text-foreground leading-7 md:leading-8 text-sm md:text-base">
                {convertedAnalysis.summary}
              </p>
            </div>
          </div>
        )}

        {/* Key Takeaways Section */}
        {convertedAnalysis.takeaways && convertedAnalysis.takeaways.length > 0 && (
          <div className="space-y-1.5 md:space-y-2">
            <SectionHeader icon={<Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-white" />} title="Key Takeaways" />
            <div className="pl-2 md:pl-3">
              <ul className="space-y-1 md:space-y-1.5">
                {convertedAnalysis.takeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-2 md:gap-3">
                    <span className="text-primary font-bold mt-0.5 text-sm md:text-base">•</span>
                    {renderText(takeaway)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Video Chapters Section */}
        {convertedAnalysis.chapters && convertedAnalysis.chapters.length > 0 && (
          <div className="space-y-1.5 md:space-y-2">
            <SectionHeader icon={<BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />} title="Video Chapters" />

            <div className="pl-2 md:pl-3 space-y-6 relative">
              {/* Vertical line connecting chapters */}
              <div className="absolute left-[29px] top-6 bottom-6 w-0.5 bg-primary/30 z-0" />
              
              {convertedAnalysis.chapters.map((chapter, index) => (
                <div key={index} className="relative z-10 space-y-1 md:space-y-1.5">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-card border-2 border-primary/30 group-hover:border-primary group-hover:text-primary flex items-center justify-center text-primary shadow-sm transition-colors mt-0.5 z-10">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h5 className="text-base md:text-lg font-semibold text-primary">{chapter.header}</h5>
                      <p className="text-foreground leading-7 md:leading-8 text-sm md:text-base mt-1">{chapter.summary}</p>
                      {chapter.key_points && chapter.key_points.length > 0 && (
                        <ul className="space-y-0.5 md:space-y-1 mt-2">
                          {chapter.key_points.map((point, pIndex) => (
                            <li key={pIndex} className="flex items-start gap-2 md:gap-3">
                              <span className="text-primary font-bold mt-0.5 text-sm md:text-base">•</span>
                              <span className="text-foreground leading-7 md:leading-8 text-sm md:text-base">{point}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keywords Section - now from Analysis model */}
        {convertedAnalysis.keywords && convertedAnalysis.keywords.length > 0 && (
          <div className="space-y-1.5 md:space-y-2">
            <SectionHeader icon={<span className="text-white font-bold text-sm md:text-base">#</span>} title="Keywords" />
            <div className="pl-2 md:pl-3">
              <div className="flex flex-wrap gap-2">
                {convertedAnalysis.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
