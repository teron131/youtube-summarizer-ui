import { ExampleUrls } from "@/components/ExampleUrls";
import { ModelSelector } from "@/components/ModelSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ComboboxOption } from "@/components/ui/editable-combobox";
import { Input } from "@/components/ui/input";
import { useLanguageSelection, useModelSelection, useUserPreferences } from "@/hooks/use-config";
import { isFormValid, prepareProcessingOptions, validateYouTubeUrl } from "@/lib/form-validation";
import { getProviderLogo } from "@/lib/provider-logos";
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

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    if (validationError) {
      setValidationError("");
    }
    setShowExamples(newUrl.trim().length === 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();

    // Prepare processing options
    const options = prepareProcessingOptions(
      preferences.targetLanguage,
      preferences.analysisModel,
      preferences.qualityModel
    );

    // Allow empty input for example output
    if (!trimmedUrl) {
      setValidationError("");
      onSubmit("", options);
      return;
    }

    // Validate URL
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
    <Card className="relative overflow-hidden rounded-[28px] border border-primary/15 bg-gradient-to-b from-background/85 via-background/70 to-background/60 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-primary/50" />

      <div className="space-y-8 p-8 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Options Section - Grid layout for 3 items */}
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border/60 bg-muted/30 p-4 md:grid-cols-3">
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
              className={`h-16 rounded-2xl border-2 bg-card/70 px-6 text-lg shadow-inner transition-all duration-300 placeholder:text-muted-foreground/80 focus:border-primary focus:ring-primary ${
                validationError ? "border-destructive focus:ring-destructive" : "border-border/60 hover:border-primary/40"
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
            {showExamples && <ExampleUrls onSelect={handleExampleClick} />}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !isFormValid(url)}
            className="group relative flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-primary/80 text-lg font-semibold text-white shadow-2xl transition-transform duration-300 hover:scale-[1.01] hover:bg-primary/60 focus-visible:ring-2 focus-visible:ring-primary/80 disabled:scale-100 disabled:opacity-60"
          >
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-20 bg-white/10" />
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-lg break-words">Processing video...</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-lg break-words">
                  {url.trim().length === 0 ? "See example" : "Summarize video"}
                </span>
              </>
            )}
          </Button>
        </form>

        {/* Help text and examples - only show when not showing examples above */}
        {!showExamples && (
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Supported YouTube URL formats</p>
              <span className="text-xs rounded-full bg-primary/10 px-3 py-1 text-primary">Drop an empty link to preview</span>
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
