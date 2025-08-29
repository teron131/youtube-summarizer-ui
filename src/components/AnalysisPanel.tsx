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

    if (analysis.overall_summary) {
      markdown += "# Overall Summary\n\n";
      markdown += `${analysis.overall_summary}\n\n`;
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
      <div className="space-y-4 md:space-y-6">
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

        {/* Overall Summary Section */}
        {analysis.overall_summary && (
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h4 className="text-base md:text-lg font-bold text-primary">Overall Summary</h4>
            </div>
            <div className="pl-9 md:pl-11">
              <p className="text-foreground leading-relaxed text-sm md:text-base">
                {analysis.overall_summary}
              </p>
            </div>
          </div>
        )}

        {/* Key Takeaways Section */}
        {analysis.takeaways && analysis.takeaways.length > 0 && (
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h4 className="text-base md:text-lg font-bold text-primary">Key Takeaways</h4>
            </div>
            <div className="pl-9 md:pl-11">
              <ul className="space-y-1.5 md:space-y-2">
                {analysis.takeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-2 md:gap-3">
                    <span className="text-primary font-bold mt-0.5 text-sm md:text-base">•</span>
                    <span className="text-foreground leading-relaxed text-sm md:text-base">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Key Facts Section */}
        {analysis.key_facts && analysis.key_facts.length > 0 && (
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h4 className="text-base md:text-lg font-bold text-primary">Key Facts</h4>
            </div>
            <div className="pl-9 md:pl-11">
              <ul className="space-y-1.5 md:space-y-2">
                {analysis.key_facts.map((fact, index) => (
                  <li key={index} className="flex items-start gap-2 md:gap-3">
                    <span className="text-primary font-bold mt-0.5 text-sm md:text-base">•</span>
                    <span className="text-foreground leading-relaxed text-sm md:text-base">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Video Chapters Section */}
        {analysis.chapters && analysis.chapters.length > 0 && (
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h4 className="text-base md:text-lg font-bold text-primary">Video Chapters</h4>
            </div>
            
            <div className="pl-9 md:pl-11 space-y-3 md:space-y-4">
              {analysis.chapters.map((chapter, index) => (
                <div key={index} className="space-y-1.5 md:space-y-2">
                  <h5 className="text-base md:text-lg font-semibold text-primary">{chapter.header}</h5>
                  <p className="text-foreground leading-relaxed text-sm md:text-base">{chapter.summary}</p>
                  
                  {chapter.key_points && chapter.key_points.length > 0 && (
                    <ul className="space-y-1 md:space-y-1.5">
                      {chapter.key_points.map((point, pIndex) => (
                        <li key={pIndex} className="flex items-start gap-2 md:gap-3">
                          <span className="text-primary font-bold mt-0.5 text-sm md:text-base">•</span>
                          <span className="text-foreground leading-relaxed text-sm md:text-base">{point}</span>
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
