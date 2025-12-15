/**
 * Form component for YouTube URL input and video processing options.
 */

import { ExampleUrls } from "@/components/ExampleUrls";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VideoProcessingOptions } from "@/components/VideoProcessingOptions";
import { useUserPreferences } from "@/hooks/use-config";
import { isFormValid, prepareProcessingOptions, validateYouTubeUrl } from "@/lib/form-validation";
import { AlertCircle, Loader2, Play } from "lucide-react";
import { useEffect, useState } from "react";

interface VideoUrlFormProps {
  onSubmit: (url: string, options?: {
    targetLanguage?: string;
    analysisModel?: string;
    qualityModel?: string;
  }) => void;
  isLoading: boolean;
  initialUrl?: string;
}

export const VideoUrlForm = ({ onSubmit, isLoading, initialUrl }: VideoUrlFormProps) => {
  const [url, setUrl] = useState(initialUrl || "");
  const [validationError, setValidationError] = useState<string>("");
  const [showExamples, setShowExamples] = useState(false);
  const { preferences } = useUserPreferences();

  useEffect(() => {
    if (initialUrl) setUrl(initialUrl);
  }, [initialUrl]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    if (validationError) setValidationError("");
    setShowExamples(newUrl.trim().length === 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();

    const options = prepareProcessingOptions(
      preferences.targetLanguage,
      preferences.analysisModel,
      preferences.qualityModel,
    );

    if (!trimmedUrl) {
      setValidationError("");
      onSubmit("", options);
      return;
    }

    const validation = validateYouTubeUrl(trimmedUrl);
    if (!validation.isValid) {
      setValidationError(validation.error || "Invalid URL");
      return;
    }

    setValidationError("");
    onSubmit(trimmedUrl, options);
  };

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl);
    setShowExamples(false);
    setValidationError("");
  };

  return (
    <Card className="border-border/40 bg-card/90 backdrop-blur-sm shadow-2xl shadow-black/50">
      <div className="space-y-6 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <VideoProcessingOptions />

          <div className="space-y-3">
            <Input
              type="url"
              placeholder="https://youtube.com/watch?v=dQw4w9WgXcQ"
              value={url}
              onChange={handleUrlChange}
              className={`h-14 rounded-xl border-2 bg-input/50 px-5 text-base shadow-inner transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                validationError
                  ? "border-destructive focus:ring-destructive/20"
                  : "border-border hover:border-muted-foreground/40"
              }`}
              disabled={isLoading}
            />

            {validationError && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            {showExamples && <ExampleUrls onSelect={handleExampleClick} />}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !isFormValid(url)}
            className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-primary text-base font-bold text-white shadow-lg shadow-primary/40 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/50 focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing video...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{url.trim().length === 0 ? "See example" : "Summarize video"}</span>
              </>
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
};
