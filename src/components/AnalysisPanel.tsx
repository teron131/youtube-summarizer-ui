import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateYouTubeTimestampUrl, isValidTimestamp } from "@/lib/utils";
import { AnalysisData, QualityData, TimestampedText } from "@/services/api";
import { BookOpen, Clock, Copy, FileText, Lightbulb, ListChecks, Sparkles } from "lucide-react";

interface AnalysisPanelProps {
  analysis: AnalysisData;
  quality?: QualityData;
  videoUrl?: string;
}

// Helper component to render timestamped text with clickable timestamps
interface TimestampedTextRendererProps {
  item: TimestampedText;
  videoUrl?: string;
  className?: string;
}

const TimestampedTextRenderer = ({ item, videoUrl, className = "" }: TimestampedTextRendererProps) => {
  const hasValidTimestamp = item.timestamp && isValidTimestamp(item.timestamp);
  const timestampUrl = hasValidTimestamp && videoUrl ? generateYouTubeTimestampUrl(videoUrl, item.timestamp!) : undefined;

  if (hasValidTimestamp && timestampUrl) {
    return (
      <div className={`flex items-start gap-2 ${className}`}>
        <span className="text-foreground leading-7 md:leading-8 text-sm md:text-base flex-1">
          {item.text}
        </span>
        <a
          href={timestampUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-md hover:bg-primary/20 transition-colors duration-200 whitespace-nowrap"
          title={`Jump to ${item.timestamp} in video`}
        >
          <Clock className="w-3 h-3" />
          {item.timestamp}
        </a>
      </div>
    );
  }

  return (
    <span className={`text-foreground leading-7 md:leading-8 text-sm md:text-base ${className}`}>
      {item.text}
    </span>
  );
};

export const AnalysisPanel = ({ analysis, quality, videoUrl }: AnalysisPanelProps) => {
  const { toast } = useToast();

  if (!analysis) {
    return null;
  }

  const generateMarkdown = () => {
    let markdown = "# AI Analysis\n\n";

    if (analysis.summary) {
      markdown += "# Summary\n\n";
      markdown += `${analysis.summary}\n\n`;
    }

    if (analysis.takeaways && analysis.takeaways.length > 0) {
      markdown += "# Key Takeaways\n\n";
      analysis.takeaways.forEach(takeaway => {
        const text = takeaway.text || takeaway;
        const timestamp = takeaway.timestamp;
        if (timestamp && videoUrl) {
          const timestampUrl = generateYouTubeTimestampUrl(videoUrl, timestamp);
          markdown += `- ${text} [[${timestamp}](${timestampUrl})]\n`;
        } else {
          markdown += `- ${text}\n`;
        }
      });
      markdown += "\n";
    }

    if (analysis.key_facts && analysis.key_facts.length > 0) {
      markdown += "# Key Facts\n\n";
      analysis.key_facts.forEach(fact => {
        const text = fact.text || fact;
        const timestamp = fact.timestamp;
        if (timestamp && videoUrl) {
          const timestampUrl = generateYouTubeTimestampUrl(videoUrl, timestamp);
          markdown += `- ${text} [[${timestamp}](${timestampUrl})]\n`;
        } else {
          markdown += `- ${text}\n`;
        }
      });
      markdown += "\n";
    }

    if (analysis.keywords && analysis.keywords.length > 0) {
      markdown += "# Keywords\n\n";
      analysis.keywords.forEach(keyword => {
        markdown += `- ${keyword}\n`;
      });
      markdown += "\n";
    }

    if (analysis.chapters && analysis.chapters.length > 0) {
      markdown += "# Video Chapters\n\n";
      analysis.chapters.forEach(chapter => {
        const headerText = chapter.header;
        const timestamp = chapter.timestamp;
        if (timestamp && videoUrl) {
          const timestampUrl = generateYouTubeTimestampUrl(videoUrl, timestamp);
          markdown += `## ${headerText} [[${timestamp}](${timestampUrl})]\n\n`;
        } else {
          markdown += `## ${headerText}\n\n`;
        }
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
        description: "Analysis copied to clipboard in markdown format",
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
        {analysis.summary && (
          <div className="space-y-1.5 md:space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h4 className="text-base md:text-lg font-bold text-primary">Summary</h4>
            </div>
            <div className="pl-2 md:pl-3">
              <p className="text-foreground leading-7 md:leading-8 text-sm md:text-base">
                {analysis.summary}
              </p>
            </div>
          </div>
        )}

        {/* Key Takeaways Section */}
        {analysis.takeaways && analysis.takeaways.length > 0 && (
          <div className="space-y-1.5 md:space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h4 className="text-base md:text-lg font-bold text-primary">Key Takeaways</h4>
            </div>
            <div className="pl-2 md:pl-3">
              <ul className="space-y-1 md:space-y-1.5">
                {analysis.takeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-2 md:gap-3">
                    <span className="text-primary font-bold mt-0.5 text-sm md:text-base">•</span>
                    <TimestampedTextRenderer item={takeaway} videoUrl={videoUrl} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Key Facts Section */}
        {analysis.key_facts && analysis.key_facts.length > 0 && (
          <div className="space-y-1.5 md:space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h4 className="text-base md:text-lg font-bold text-primary">Key Facts</h4>
            </div>
            <div className="pl-2 md:pl-3">
              <ul className="space-y-1 md:space-y-1.5">
                {analysis.key_facts.map((fact, index) => (
                  <li key={index} className="flex items-start gap-2 md:gap-3">
                    <span className="text-primary font-bold mt-0.5 text-sm md:text-base">•</span>
                    <TimestampedTextRenderer item={fact} videoUrl={videoUrl} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Video Chapters Section */}
        {analysis.chapters && analysis.chapters.length > 0 && (
          <div className="space-y-1.5 md:space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h4 className="text-base md:text-lg font-bold text-primary">Video Chapters</h4>
            </div>
            
            <div className="pl-2 md:pl-3 space-y-2 md:space-y-3">
              {analysis.chapters.map((chapter, index) => {
                const hasValidTimestamp = chapter.timestamp && isValidTimestamp(chapter.timestamp);
                const timestampUrl = hasValidTimestamp && videoUrl ? generateYouTubeTimestampUrl(videoUrl, chapter.timestamp!) : undefined;

                return (
                  <div key={index} className="space-y-1 md:space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h5 className="text-base md:text-lg font-semibold text-primary">{chapter.header}</h5>
                      {hasValidTimestamp && timestampUrl && (
                        <a
                          href={timestampUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-md hover:bg-primary/20 transition-colors duration-200 whitespace-nowrap"
                          title={`Jump to ${chapter.timestamp} in video`}
                        >
                          <Clock className="w-3 h-3" />
                          {chapter.timestamp}
                        </a>
                      )}
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
                );
              })}
            </div>
          </div>
        )}

        {/* Keywords Section - now from Analysis model */}
        {analysis.keywords && analysis.keywords.length > 0 && (
          <div className="space-y-1.5 md:space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm md:text-base">#</span>
              </div>
              <h4 className="text-base md:text-lg font-bold text-primary">Keywords</h4>
            </div>
            <div className="pl-2 md:pl-3">
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.map((keyword, index) => (
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
