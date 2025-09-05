import AnthropicLogo from "@/assets/logos/anthropic.svg";
import GoogleLogo from "@/assets/logos/google.svg";
import OpenAILogo from "@/assets/logos/openai.svg";
import XaiLogo from "@/assets/logos/xai.svg";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguageSelection, useModelSelection, useUserPreferences } from "@/hooks/use-config";
import { AlertCircle, Bot, ExternalLink, Languages, Loader2, Play, Youtube } from "lucide-react";
import { useState } from "react";

interface VideoUrlFormProps {
  onSubmit: (url: string, options?: {
    targetLanguage?: string;
    analysisModel?: string;
    qualityModel?: string;
  }) => void;
  isLoading: boolean;
}
 
// Utility function to get provider logo
const getProviderLogo = (provider: string) => {
  const logoMap = {
    google: GoogleLogo,
    anthropic: AnthropicLogo,
    openai: OpenAILogo,
    'x-ai': XaiLogo,
  };
  return logoMap[provider as keyof typeof logoMap] || null;
};

export const VideoUrlForm = ({ onSubmit, isLoading }: VideoUrlFormProps) => {
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState<string>("");
  const [showExamples, setShowExamples] = useState(false);

  // Use configuration hooks
  const { languages } = useLanguageSelection();
  const { models } = useModelSelection();
  const { preferences, updatePreferences } = useUserPreferences();

  // Helper function to validate form
  const isFormValid = (inputUrl: string) => {
    const trimmedUrl = inputUrl.trim();
    return trimmedUrl.length === 0 ||
           (trimmedUrl.length > 10 && (trimmedUrl.includes("youtube.com") || trimmedUrl.includes("youtu.be")));
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
    if (!trimmedUrl.includes("youtube.com") && !trimmedUrl.includes("youtu.be")) {
      setValidationError("Please enter a valid YouTube URL (youtube.com or youtu.be).");
      return;
    }

    setValidationError("");
    onSubmit(trimmedUrl, options);
  };

  // Example URLs for demonstration
  const exampleUrls = [
    "https://youtu.be/dQw4w9WgXcQ",
    "https://youtube.com/watch?v=jNQXAC9IVRw", 
    "https://youtube.com/watch?v=9bZkp7q19f0"
  ];

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl);
    setShowExamples(false);
    setValidationError("");
  };
 
  return (
    <Card className="p-10 modern-blur shadow-glass hover-lift">
      <div className="space-y-8">
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Options Section - Centered with equal gaps */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-24 pb-6 border-b border-muted">
            {/* Model Selection */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 group relative">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                {/* Tooltip on hover */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded border border-gray-300/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Model
                </div>
              </div>

              <Select value={preferences.analysisModel} onValueChange={(value) => updatePreferences({ analysisModel: value, qualityModel: value })}>
                <SelectTrigger className="w-full sm:w-64 h-8 bg-red-800 text-white border-red-500/30 hover:bg-red-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-red-800 border-red-800/30">
                  {models.map((modelOption) => {
                    const provider = modelOption.provider;
                    const Logo = getProviderLogo(provider);
                    return (
                      <SelectItem
                        key={modelOption.key}
                        value={modelOption.key}
                        className="text-white hover:bg-red-700"
                      >
                        <span className="flex items-center gap-2">
                          {Logo ? <img src={Logo as unknown as string} alt={provider} className="w-4 h-4" /> : <span className="w-4 h-4" />}
                          {modelOption.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Language Selection */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-10 h-8 bg-primary rounded-full flex items-center justify-center group relative">
                <Languages className="w-4 h-4 text-white" />
                {/* Tooltip on hover */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded border border-gray-300/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Language
                </div>
              </div>

              <Select value={preferences.targetLanguage} onValueChange={(value) => updatePreferences({ targetLanguage: value })}>
                <SelectTrigger className="w-full sm:w-64 h-8 bg-red-800 text-white border-red-500/30 hover:bg-red-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-red-800 border-red-800/30">
                  {languages.map((lang) => (
                    <SelectItem
                      key={lang.key}
                      value={lang.key}
                      className="text-white hover:bg-red-800"
                    >
                      <span className="flex items-center gap-2">
                        {lang.flag && <span className="text-lg leading-none">{lang.flag}</span>}
                        {lang.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <div className="space-y-3">
                <Alert className="border-primary/50 bg-primary/5">
                  <Youtube className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-primary">
                    Try one of these example URLs to see how it works:
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-2">
                  {exampleUrls.map((exampleUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleExampleClick(exampleUrl)}
                      className="text-left p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-3 h-3 text-primary" />
                        <code className="text-sm text-muted-foreground">{exampleUrl}</code>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || !isFormValid(url)}
            className="w-full h-16 text-lg bg-primary text-white font-bold hover:shadow-button transition-all duration-500 hover:scale-[1.02] youtube-pulse rounded-2xl disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none border border-primary/30 hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                <span className="font-bold">Processing Video...</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 mr-3" />
                <span className="font-bold">
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
