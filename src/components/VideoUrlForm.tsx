import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Play, AlertCircle, ExternalLink, Youtube } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { handleApiError } from "@/services/api";
 
interface VideoUrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}
 
export const VideoUrlForm = ({ onSubmit, isLoading }: VideoUrlFormProps) => {
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState<string>("");
  const [showExamples, setShowExamples] = useState(false);
  const [translate, setTranslate] = useState(false);
  const [language, setLanguage] = useState("en");
  const [model, setModel] = useState("gemini-2.5-pro");
 
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
    
    // Allow empty input for example output
    if (!trimmedUrl) {
      setValidationError("");
      onSubmit(""); // Send empty string to trigger example response
      return;
    }

    // Basic client-side check for non-empty URLs
    if (!trimmedUrl.includes("youtube.com") && !trimmedUrl.includes("youtu.be")) {
      setValidationError("Please enter a valid YouTube URL (youtube.com or youtu.be).");
      return;
    }

    setValidationError("");
    onSubmit(trimmedUrl);
  };
 
  const isFormValid = url.trim().length === 0 || (url.trim().length > 10 && (url.includes("youtube.com") || url.includes("youtu.be")));

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
            disabled={isLoading || !isFormValid}
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

        {/* Options Section */}
        <div className="space-y-4 border-t border-muted pt-6">
          {/* Translate Toggle and Language Selection */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm">🌐</span>
              <Toggle
                pressed={translate}
                onPressedChange={setTranslate}
                className="text-sm"
              >
                Translate
              </Toggle>
            </div>
            
            {translate && (
              <ToggleGroup 
                type="single" 
                value={language} 
                onValueChange={(value) => value && setLanguage(value)}
                className="gap-1"
              >
                <ToggleGroupItem value="en" aria-label="English" className="text-sm px-3 py-1">
                  EN
                </ToggleGroupItem>
                <ToggleGroupItem value="zh" aria-label="Chinese" className="text-sm px-3 py-1">
                  ZH
                </ToggleGroupItem>
              </ToggleGroup>
            )}
          </div>

          {/* Model Selection */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">🤖</span>
              <span className="text-sm font-medium">Model:</span>
            </div>
            
            <ToggleGroup 
              type="single" 
              value={model} 
              onValueChange={(value) => value && setModel(value)}
              className="gap-1"
            >
              <ToggleGroupItem value="gemini-2.5-pro" aria-label="Gemini 2.5 Pro" className="text-sm px-3 py-1">
                Gemini 2.5 Pro
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

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
