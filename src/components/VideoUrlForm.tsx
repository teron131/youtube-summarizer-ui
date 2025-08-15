import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Play, AlertCircle, ExternalLink } from "lucide-react";
import { isValidYouTubeUrl } from "@/services/api";

interface VideoUrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export const VideoUrlForm = ({ onSubmit, isLoading }: VideoUrlFormProps) => {
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState<string>("");

  const validateUrl = (inputUrl: string): string => {
    if (!inputUrl.trim()) {
      return "";
    }
    
    if (!isValidYouTubeUrl(inputUrl)) {
      return "Please enter a valid YouTube URL (e.g., https://youtube.com/watch?v=...)";
    }
    
    return "";
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setValidationError(validateUrl(newUrl));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedUrl = url.trim();
    const error = validateUrl(trimmedUrl);
    
    if (error) {
      setValidationError(error);
      return;
    }
    
    setValidationError("");
    onSubmit(trimmedUrl);
  };

  const isFormValid = url.trim() && !validationError;

  return (
    <Card className="p-8 bg-gradient-card border border-muted shadow-card backdrop-blur-sm hover-lift fade-in-up">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-primary animate-glow stagger-1">
            Summarize Any YouTube Video
          </h2>
          <p className="text-muted-foreground fade-in-up stagger-2">
            Paste a YouTube URL and get an <span className="text-primary font-semibold">AI-powered summary</span> with transcript in seconds
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 fade-in-up stagger-3">
          <div className="space-y-2">
            <Input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={handleUrlChange}
              className={`h-12 text-lg border-primary/30 focus:ring-primary focus:border-primary transition-all duration-300 hover:border-primary/50 ${
                validationError ? 'border-destructive focus:ring-destructive' : ''
              }`}
              disabled={isLoading}
            />
            
            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full h-12 text-lg bg-gradient-button text-white font-semibold hover:shadow-button transition-all duration-300 hover:scale-[1.02] hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span className="font-semibold">Processing Video...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                <span className="font-semibold">Summarize Video</span>
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
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3 h-3" />
              <code>https://youtube.com/embed/VIDEO_ID</code>
            </div>
          </div>
        </div>

        {/* Processing info */}
        {!isLoading && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Processing includes:</strong> Video info extraction, audio transcription, 
              and AI-powered summarization. This may take 1-3 minutes depending on video length.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
};