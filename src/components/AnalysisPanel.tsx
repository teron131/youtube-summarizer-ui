import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { convertAnalysisChinese } from "@/lib/utils";
import { AnalysisData, QualityData, VideoInfoResponse } from "@/services/api";
import { BookOpen, Copy, FileText, Lightbulb, ListChecks, Sparkles } from "lucide-react";

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

  const generateMarkdown = () => {
    let markdown = "";

    // Add video info if available
    if (videoInfo) {
      if (videoInfo.url) {
        markdown += `URL: ${videoInfo.url}\n`;
      }
      if (videoInfo.title) {
        markdown += `Title: ${videoInfo.title}\n`;
      }
      if (videoInfo.thumbnail) {
        markdown += `Thumbnail: ${videoInfo.thumbnail}\n`;
      }
      if (videoInfo.author) {
        markdown += `Channel: ${videoInfo.author}\n`;
      }
      if (markdown) {
        markdown += "\n";
      }
    }

    // Add summary directly (remove AI Analysis header)
    if (convertedAnalysis.summary) {
      markdown += `${convertedAnalysis.summary}\n\n`;
    }

    if (convertedAnalysis.takeaways && convertedAnalysis.takeaways.length > 0) {
      markdown += "# Key Takeaways\n\n";
      convertedAnalysis.takeaways.forEach(takeaway => {
        markdown += `- ${takeaway}\n`;
      });
      markdown += "\n";
    }

    if (convertedAnalysis.key_facts && convertedAnalysis.key_facts.length > 0) {
      markdown += "# Key Facts\n\n";
      convertedAnalysis.key_facts.forEach(fact => {
        markdown += `- ${fact}\n`;
      });
      markdown += "\n";
    }

    if (convertedAnalysis.keywords && convertedAnalysis.keywords.length > 0) {
      markdown += "# Keywords\n\n";
      convertedAnalysis.keywords.forEach(keyword => {
        markdown += `- ${keyword}\n`;
      });
      markdown += "\n";
    }

    if (convertedAnalysis.chapters && convertedAnalysis.chapters.length > 0) {
      markdown += "# Video Chapters\n\n";
      convertedAnalysis.chapters.forEach(chapter => {
        markdown += `## ${chapter.header}\n\n`;
        markdown += `${chapter.summary}\n\n`;

        if (chapter.key_points && chapter.key_points.length > 0) {
          chapter.key_points.forEach(point => {
            markdown += `- ${point}\n`;
          });
          markdown += "\n";
        }
      });
    }

    return markdown;
  };

  const copyToClipboard = async () => {
    try {
      const markdown = generateMarkdown();
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

        {/* Key Facts Section */}
        {convertedAnalysis.key_facts && convertedAnalysis.key_facts.length > 0 && (
          <div className="space-y-1.5 md:space-y-2">
            <SectionHeader icon={<FileText className="w-4 h-4 md:w-5 md:h-5 text-white" />} title="Key Facts" />
            <div className="pl-2 md:pl-3">
              <ul className="space-y-1 md:space-y-1.5">
                {convertedAnalysis.key_facts.map((fact, index) => (
                  <li key={index} className="flex items-start gap-2 md:gap-3">
                    <span className="text-primary font-bold mt-0.5 text-sm md:text-base">•</span>
                    {renderText(fact)}
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

            <div className="pl-2 md:pl-3 space-y-2 md:space-y-3">
              {convertedAnalysis.chapters.map((chapter, index) => (
                <div key={index} className="space-y-1 md:space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h5 className="text-base md:text-lg font-semibold text-primary">{chapter.header}</h5>
                  </div>
                  <p className="text-foreground leading-7 md:leading-8 text-sm md:text-base">{chapter.summary}</p>
                  {chapter.key_points && chapter.key_points.length > 0 && (
                    <ul className="space-y-0.5 md:space-y-1">
                      {chapter.key_points.map((point, pIndex) => (
                        <li key={pIndex} className="flex items-start gap-2 md:gap-3">
                          <span className="text-primary font-bold mt-0.5 text-sm md:text-base">•</span>
                          <span className="text-foreground leading-7 md:leading-8 text-sm md:text-base">{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
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
