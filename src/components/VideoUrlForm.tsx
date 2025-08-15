import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Play } from "lucide-react";

interface VideoUrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export const VideoUrlForm = ({ onSubmit, isLoading }: VideoUrlFormProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit with either the URL or empty string to trigger test data
    onSubmit(url.trim());
  };

  return (
    <Card className="p-8 bg-gradient-card border border-muted shadow-card backdrop-blur-sm">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Summarize Any YouTube Video
          </h2>
          <p className="text-muted-foreground">
            Paste a YouTube URL and get an AI-powered summary in seconds
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-12 text-lg border-muted focus:ring-primary"
              disabled={isLoading}
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
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
      </div>
    </Card>
  );
};