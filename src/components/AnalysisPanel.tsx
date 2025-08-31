import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AnalysisData } from "@/services/api";
import { BookOpen, Copy, FileText, Lightbulb, ListChecks, Sparkles } from "lucide-react";

interface AnalysisPanelProps {
  analysis: AnalysisData;
}

export const AnalysisPanel = ({ analysis }: AnalysisPanelProps) => {
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
        markdown += `- ${takeaway}\n`;
      });
      markdown += "\n";
    }

    if (analysis.key_facts && analysis.key_facts.length > 0) {
      markdown += "# Key Facts\n\n";
      analysis.key_facts.forEach(fact => {
        markdown += `- ${fact}\n`;
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
                    <span className="text-foreground leading-7 md:leading-8 text-sm md:text-base">{takeaway}</span>
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
                    <span className="text-foreground leading-7 md:leading-8 text-sm md:text-base">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Keywords Section */}
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
              {analysis.chapters.map((chapter, index) => (
                <div key={index} className="space-y-1 md:space-y-1.5">
                  <h5 className="text-base md:text-lg font-semibold text-primary">{chapter.header}</h5>
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
      </div>
    </Card>
  );
};
