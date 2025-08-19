import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Play, AlertCircle, ExternalLink } from "lucide-react";
 
interface VideoUrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}
 
export const VideoUrlForm = ({ onSubmit, isLoading }: VideoUrlFormProps) => {
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState<string>(""); // Keep for immediate feedback if needed
 
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    if (validationError) {
      setValidationError(""); // Clear error on new input
    }
  };
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setValidationError("URL cannot be empty.");
      return;
    }
    setValidationError("");
    onSubmit(trimmedUrl);
  };
 
  const isFormValid = url.trim().length > 0;
 
  return (
    <Card className="p-10 modern-blur shadow-glass hover-lift">
      <div className="space-y-8">
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Input
              type="url"
              placeholder="https://youtube.com/watch?v=dQw4w9WgXcQ"
              value={url}
              onChange={handleUrlChange}
              className={`h-16 text-lg px-6 bg-background/50 border-2 border-primary/20 focus:ring-primary focus:border-primary transition-all duration-500 hover:border-primary/40 rounded-2xl ${
                validationError ? 'border-destructive focus:ring-destructive' : ''
              }`}
              disabled={isLoading}
            />
            
            {validationError && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full h-16 text-lg bg-gradient-button text-white font-bold hover:shadow-button transition-all duration-500 hover:scale-[1.02] youtube-pulse rounded-2xl disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none border border-primary/30"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                <span className="font-bold">Processing Video...</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 mr-3" />
                <span className="font-bold">Summarize Video</span>
              </>
            )}
          </Button>
        </form>

        {/* Help text and examples */}
        <div className="border-t border-muted pt-4 space-y-3">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Supported YouTube URL formats:
            </p>
          </div>
          
          <div className="grid gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3 h-3" />
              <code>https://youtube.com/watch?v=VIDEO_ID</code>
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3 h-3" />
              <code>https://youtu.be/VIDEO_ID</code>
            </div>
          </div>
        </div>

      </div>
    </Card>
  );
};
