import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FileText, Lightbulb, ListChecks, BookOpen, Sparkles, ChevronDown, ChevronRight } from "lucide-react";
import { AnalysisData } from "@/services/api";
import { useState } from "react";

interface AnalysisPanelProps {
  analysis: AnalysisData;
}

export const AnalysisPanel = ({ analysis }: AnalysisPanelProps) => {
  const [openChapters, setOpenChapters] = useState<Record<number, boolean>>({});

  if (!analysis) {
    return null;
  }

  const toggleChapter = (index: number) => {
    setOpenChapters(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
          <ListChecks className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">Structured Analysis</h3>
          <p className="text-muted-foreground">Key insights extracted from the video content.</p>
        </div>
      </div>

      {/* Overall Summary Card */}
      {analysis.overall_summary && (
        <Card className="p-6 modern-blur shadow-glass hover-lift">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-lg font-bold text-foreground">Overall Summary</h4>
          </div>
          <p className="text-foreground leading-relaxed">
            {analysis.overall_summary}
          </p>
        </Card>
      )}

      {/* Key Takeaways Card */}
      {analysis.takeaways && analysis.takeaways.length > 0 && (
        <Card className="p-6 modern-blur shadow-glass hover-lift">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-lg font-bold text-foreground">Key Takeaways</h4>
          </div>
          <ul className="space-y-3">
            {analysis.takeaways.map((takeaway, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-foreground leading-relaxed">{takeaway}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Key Facts Card */}
      {analysis.key_facts && analysis.key_facts.length > 0 && (
        <Card className="p-6 modern-blur shadow-glass hover-lift">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-lg font-bold text-foreground">Key Facts</h4>
          </div>
          <ul className="space-y-3">
            {analysis.key_facts.map((fact, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-foreground leading-relaxed">{fact}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Video Chapters Card */}
      {analysis.chapters && analysis.chapters.length > 0 && (
        <Card className="p-6 modern-blur shadow-glass hover-lift">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-lg font-bold text-foreground">Video Chapters</h4>
          </div>
          
          <div className="space-y-4">
            {analysis.chapters.map((chapter, index) => (
              <Collapsible
                key={index}
                open={openChapters[index]}
                onOpenChange={() => toggleChapter(index)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-primary/20 hover:border-primary/40 transition-all duration-300">
                    <h5 className="text-left font-semibold text-foreground">{chapter.header}</h5>
                    {openChapters[index] ? (
                      <ChevronDown className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3">
                  <div className="p-4 space-y-4">
                    <p className="text-foreground leading-relaxed">
                      {chapter.summary}
                    </p>
                    
                    {chapter.key_points && chapter.key_points.length > 0 && (
                      <ul className="space-y-2">
                        {chapter.key_points.map((point, pIndex) => (
                          <li key={pIndex} className="flex items-start gap-3">
                            <span className="text-primary font-bold mt-1 text-sm">-</span>
                            <span className="text-foreground/90 text-sm leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};