import { ExampleUrls } from "@/components/ExampleUrls";
import { ModelSelector } from "@/components/ModelSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ComboboxOption } from "@/components/ui/editable-combobox";
import { Input } from "@/components/ui/input";
import { useLanguageSelection, useModelSelection, useUserPreferences } from "@/hooks/use-config";
import { getProviderLogo } from "@/lib/provider-logos";
import { isValidYouTubeUrl } from "@/lib/url-utils";
import { AlertCircle, Bot, ExternalLink, Languages, Loader2, Play, Sparkles } from "lucide-react";
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

  // Use configuration hooks
  const { languages } = useLanguageSelection();
  const { summarizerModels, refinerModels } = useModelSelection();
  const { preferences, updatePreferences } = useUserPreferences();

  // Update URL when initialUrl prop changes (for extension use case)
  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
    }
  }, [initialUrl]);

  const isFormValid = (inputUrl: string) => {
    const trimmedUrl = inputUrl.trim();
    return trimmedUrl.length === 0 || isValidYouTubeUrl(trimmedUrl);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    if (validationError) {
      setValidationError(""); // Clear error on new input
    }
    // Show/hide examples based on input
    setShowExamples(newUrl.trim().length === 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();

    // Prepare options - convert "auto" to null for backend (auto-detect)
    const options: {
      targetLanguage?: string;
      analysisModel?: string;
      qualityModel?: string;
    } = {
      analysisModel: preferences.analysisModel,
      qualityModel: preferences.qualityModel,
    };

    if (preferences.targetLanguage !== "auto") {
      options.targetLanguage = preferences.targetLanguage;
    }

    // Allow empty input for example output
    if (!trimmedUrl) {
      setValidationError("");
      onSubmit("", options); // Send empty string to trigger example response
      return;
    }

    // Basic client-side check for non-empty URLs
    if (!isValidYouTubeUrl(trimmedUrl)) {
      setValidationError("Please enter a valid YouTube URL (youtube.com or youtu.be).");
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

  // Prepare options for comboboxes
  const summarizerOptions: ComboboxOption[] = summarizerModels.map(m => ({
    value: m.key,
    label: m.label,
    icon: <img src={getProviderLogo(m.provider) as string} alt={m.provider} className="w-full h-full object-contain" />
  }));

  const refinerOptions: ComboboxOption[] = refinerModels.map(m => ({
    value: m.key,
    label: m.label,
    icon: <img src={getProviderLogo(m.provider) as string} alt={m.provider} className="w-full h-full object-contain" />
  }));

  const languageOptions: ComboboxOption[] = languages.map(l => ({
    value: l.key,
    label: l.label,
    icon: l.flag ? <span className="text-sm">{l.flag}</span> : undefined
  }));
 
  return (
    <Card className="p-10 modern-blur shadow-glass hover-lift">
      <div className="space-y-8">
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Options Section - Grid layout for 3 items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-muted">
            <ModelSelector
              label="Summarizer"
              icon={Bot}
              value={preferences.analysisModel}
              onChange={(value) => updatePreferences({ analysisModel: value })}
              options={summarizerOptions}
              placeholder="Select summarizer..."
            />

            <ModelSelector
              label="Refiner"
              icon={Sparkles}
              value={preferences.qualityModel}
              onChange={(value) => updatePreferences({ qualityModel: value })}
              options={refinerOptions}
              placeholder="Select refiner..."
            />

            <ModelSelector
              label="Language"
              icon={Languages}
              value={preferences.targetLanguage}
              onChange={(value) => updatePreferences({ targetLanguage: value })}
              options={languageOptions}
              placeholder="Select language..."
            />
          </div>

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

            {/* Example URLs when empty input */}
            {showExamples && (
              <ExampleUrls onSelect={handleExampleClick} />
            )}
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || !isFormValid(url)}
            className="w-full h-16 text-lg bg-primary text-white font-bold hover:shadow-button transition-all duration-500 hover:scale-[1.02] youtube-pulse rounded-2xl disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none border border-primary/30 hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin flex-shrink-0" />
                <span className="font-bold text-sm sm:text-lg break-words">Processing Video...</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 mr-3 flex-shrink-0" />
                <span className="font-bold text-sm sm:text-lg break-words">
                  {url.trim().length === 0 ? "See Example" : "Summarize Video"}
                </span>
              </>
            )}
          </Button>
        </form>

        {/* Help text and examples - only show when not showing examples above */}
        {!showExamples && (
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
        )}

      </div>
    </Card>
  );
};
