import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SummaryPanelProps {
  summary: string;
}

export const SummaryPanel = ({ summary }: SummaryPanelProps) => {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      toast({
        title: "Copied!",
        description: "Summary copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy summary",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 bg-gradient-card border border-muted shadow-card backdrop-blur-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">AI Summary</h3>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy Summary
          </Button>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {summary}
          </p>
        </div>
      </div>
    </Card>
  );
};