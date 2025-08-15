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
    <Card className="p-8 bg-gradient-card border border-muted shadow-card backdrop-blur-sm">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Summarize Any YouTube Video
          </h2>
          <p className="text-muted-foreground">
            Paste a YouTube URL and get an AI-powered summary with transcript in seconds
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={handleUrlChange}
              className={`h-12 text-lg border-muted focus:ring-primary ${
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
            className="w-full h-12 text-lg bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Video...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Summarize Video
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