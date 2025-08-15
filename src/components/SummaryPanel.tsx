import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    <Card className="p-8 modern-blur shadow-glass hover-lift">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">AI Summary</h3>
              <p className="text-muted-foreground">Intelligent analysis powered by advanced AI</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="lg"
            onClick={copyToClipboard}
            className="gap-3 h-12 px-6 border-primary/30 hover:bg-primary/10 hover:border-primary transition-all duration-300"
          >
            <Copy className="w-5 h-5" />
            Copy Summary
          </Button>
        </div>
        
        <div className="glass-effect rounded-2xl p-6 border border-primary/10">
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {summary}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </Card>
  );
};