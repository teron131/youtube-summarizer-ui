import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Copy, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    <Card className="bg-gradient-card border border-muted shadow-card backdrop-blur-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-6 h-auto justify-between hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold">Full Transcript</span>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-6 pb-6">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Transcript
              </Button>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 max-h-96 overflow-y-auto">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {transcript}
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};