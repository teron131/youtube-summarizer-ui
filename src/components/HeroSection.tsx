/**
 * Hero section component with branding, features, and main video input form.
 */

import { VideoUrlForm } from "@/components/VideoUrlForm";
import { ShieldCheck, Sparkles, Zap } from "lucide-react";

interface HeroSectionProps {
  onSubmit: (url: string, options?: {
    targetLanguage?: string;
    analysisModel?: string;
    qualityModel?: string;
  }) => void;
  isLoading: boolean;
  initialUrl?: string;
}

const FEATURES = [
  { Icon: Zap, label: "Fast Processing", value: "< 1 min completion" },
  { Icon: ShieldCheck, label: "Structured Analysis", value: "Save time on long videos" },
  { Icon: Sparkles, label: "Model Neutral", value: "OpenRouter models" },
];

export function HeroSection({ onSubmit, isLoading, initialUrl }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Dramatic red glow at top */}
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      
      <div className="relative container mx-auto px-6 sm:px-8 pt-16 pb-24 lg:pb-32">
        <div className="flex flex-col items-center gap-12">
          <div className="space-y-8 w-full max-w-8xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full bg-primary/15 border border-primary/30 px-4 py-2 text-sm font-semibold text-primary fade-in-up">
              <Sparkles className="h-4 w-4" />
              Powered by Scrape Creators & OpenRouter
            </div>

            {/* Main Title */}
            <div className="space-y-2 fade-in-up stagger-1">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight">
                <span className="text-white">YouTube Video</span>
                <span className="block text-primary mt-2">Structured Analysis</span>
              </h1>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 fade-in-up stagger-2">
              {FEATURES.map((item) => (
                <div 
                  key={item.label} 
                  className="flex items-center gap-3 bg-card/80 border border-border/50 rounded-full px-5 py-3 transition-all hover:border-primary/40 hover:bg-card"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                    <item.Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">{item.label}</span>
                    <span className="text-sm text-muted-foreground">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="relative fade-in-up stagger-3 w-full max-w-8xl">
            <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-3xl opacity-50" />
            <VideoUrlForm onSubmit={onSubmit} isLoading={isLoading} initialUrl={initialUrl} />
          </div>
        </div>
      </div>
    </section>
  );
}

