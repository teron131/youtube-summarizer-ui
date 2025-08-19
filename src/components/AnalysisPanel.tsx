import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, Lightbulb, ListChecks } from "lucide-react";
import { AnalysisData } from "@/services/api";

interface AnalysisPanelProps {
  analysis: AnalysisData;
}

export const AnalysisPanel = ({ analysis }: AnalysisPanelProps) => {
  if (!analysis) {
    return null;
  }

  return (
    <Card className="p-8 modern-blur shadow-glass hover-lift">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <ListChecks className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Structured Analysis</h3>
            <p className="text-muted-foreground">Key insights extracted from the video content.</p>
          </div>
        </div>

        <div className="space-y-4">
            {analysis.takeaways && analysis.takeaways.length > 0 && (
                <div className="glass-effect rounded-2xl p-6 border border-primary/10">
                    <h4 className="flex items-center gap-2 text-lg font-semibold mb-3">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        Key Takeaways
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-foreground/90">
                        {analysis.takeaways.map((takeaway, index) => (
                            <li key={index}>{takeaway}</li>
                        ))}
                    </ul>
                </div>
            )}

            {analysis.key_facts && analysis.key_facts.length > 0 && (
                 <div className="glass-effect rounded-2xl p-6 border border-primary/10">
                    <h4 className="flex items-center gap-2 text-lg font-semibold mb-3">
                        <FileText className="w-5 h-5 text-primary" />
                        Key Facts
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-foreground/90">
                        {analysis.key_facts.map((fact, index) => (
                            <li key={index}>{fact}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

        {analysis.chapters && analysis.chapters.length > 0 && (
            <div>
                 <h4 className="flex items-center gap-2 text-lg font-semibold mb-3">
                    Video Chapters
                </h4>
                <Accordion type="single" collapsible className="w-full">
                    {analysis.chapters.map((chapter, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="glass-effect rounded-2xl mb-2 border border-primary/10 px-4">
                            <AccordionTrigger className="text-lg font-medium hover:no-underline">{chapter.header}</AccordionTrigger>
                            <AccordionContent className="pt-2">
                                <p className="mb-3 text-base">{chapter.summary}</p>
                                {chapter.key_points && chapter.key_points.length > 0 && (
                                    <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80">
                                        {chapter.key_points.map((point, pIndex) => (
                                            <li key={pIndex}>{point}</li>
                                        ))}
                                    </ul>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        )}
      </div>
    </Card>
  );
};