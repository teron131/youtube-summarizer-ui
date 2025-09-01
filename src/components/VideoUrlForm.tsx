import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Bot, ExternalLink, Languages, Loader2, Play, Youtube } from "lucide-react";
import { useState } from "react";
 
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
          {/* Options Section - Moved above input */}
          <div className="grid grid-cols-2 gap-6 pb-6 border-b border-muted">
            {/* Left Column - Translate Toggle and Language Selection */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Languages className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">Translate</span>
                <Switch
                  checked={translate}
                  onCheckedChange={setTranslate}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              
              {translate && (
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-40 h-8 bg-primary text-white border-primary/30 hover:bg-primary/90">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-primary border-primary/30">
                    <SelectItem value="zh" className="text-white hover:bg-primary/80">Chinese</SelectItem>
                    <SelectItem value="en" className="text-white hover:bg-primary/80">English</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Right Column - Model Selection */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="w-40 h-8 bg-primary text-white border-primary/30 hover:bg-primary/90">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-primary border-primary/30">
                  <SelectItem value="gemini-2.5-pro" className="text-white hover:bg-primary/80">Gemini 2.5 Pro</SelectItem>
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
