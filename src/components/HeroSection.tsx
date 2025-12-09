import heroBackground from "@/assets/youtube-subtle-background.jpg";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VideoUrlForm } from "@/components/VideoUrlForm";

interface HeroSectionProps {
  onSubmit: (url: string, options?: {
    targetLanguage?: string;
    analysisModel?: string;
    qualityModel?: string;
  }) => void;
  isLoading: boolean;
  initialUrl?: string;
}

export function HeroSection({ onSubmit, isLoading, initialUrl }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden min-h-screen flex items-center bg-background">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
      </div>
      
      {/* Content */}
      <div className="relative container mx-auto px-4 pt-4 pb-20">
        <div className="text-center space-y-4 mb-8">
          <div className="fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-primary text-base font-medium">Powered by Gemini, Scrape Creators, Fal</span>
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground fade-in-up stagger-1">
            YouTube
            <br />
            <span className="animate-glow bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Summarizer
            </span>
          </h1>
          
          <p className="text-xl sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed fade-in-up stagger-2">
            Transform any 
            <span className="text-primary font-semibold"> YouTube </span>
             video into structured summaries.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-base text-muted-foreground fade-in-up stagger-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-primary rounded-full" />
              <span>Scrap / Transcribe + Summarize</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-primary rounded-full" />
              <span>Structured Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-primary rounded-full" />
              <span>Time Saving</span>
            </div>
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto fade-in-up stagger-4">
          <VideoUrlForm onSubmit={onSubmit} isLoading={isLoading} initialUrl={initialUrl} />
        </div>
      </div>
    </div>
  );
}

