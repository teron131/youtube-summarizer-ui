import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp, Copy, FileText } from "lucide-react";
import { useState } from "react";

interface TranscriptPanelProps {
  transcript: string;
}

export const TranscriptPanel = ({ transcript }: TranscriptPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      toast({
        title: "Copied!",
        description: "Transcript copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy transcript",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="relative rounded-2xl border border-border/60 bg-card/60 shadow-sm overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-8 h-auto justify-between hover:bg-primary/5 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold text-foreground block">Transcript</span>
                <span className="text-muted-foreground">Complete video transcription</span>
              </div>
            </div>
            {isOpen ? (
              <ChevronUp className="w-6 h-6 text-primary" />
            ) : (
              <ChevronDown className="w-6 h-6 text-primary" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-8 pb-8">
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="lg"
                onClick={copyToClipboard}
                className="gap-3 h-12 px-6 border-primary/30 hover:bg-primary/10 hover:border-primary transition-all duration-300"
              >
                <Copy className="w-5 h-5" />
                Copy Transcript
              </Button>
            </div>
            
            <div className="glass-effect rounded-2xl p-6 max-h-96 overflow-y-auto border border-primary/10">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap font-mono text-sm">
                {transcript}
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};