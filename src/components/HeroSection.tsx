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
    <section className="relative overflow-hidden bg-transparent">
      <div className="relative container mx-auto px-6 sm:px-8 pt-14 pb-20 lg:pb-28">
        <div className="flex flex-col items-center gap-10">
          <div className="space-y-8 w-full max-w-8xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm fade-in-up">
              <Sparkles className="h-4 w-4" />
              Powered by Scrape Creators & OpenRouter
            </div>

            <div className="space-y-4 fade-in-up stagger-1">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-foreground">
                YouTube Video
                <span className="block bg-gradient-to-r from-primary via-primary/80 to-white bg-clip-text text-transparent animate-glow pb-2">
                  Structured Analysis
                </span>
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl border border-border/50 bg-muted/30 p-4 md:p-6 fade-in-up stagger-2">
              {FEATURES.map((item) => (
                <div key={item.label} className="flex flex-col gap-2 group relative">
                  <div className="flex items-center gap-2 relative">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <item.Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-bold text-primary uppercase tracking-wide">{item.label}</span>
                  </div>
                  <div className="h-10 flex items-center px-3 rounded-md bg-background/50 border border-border/50 text-sm font-medium text-foreground">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative fade-in-up stagger-3 w-full max-w-8xl">
            <div className="absolute inset-0 -z-10 rounded-[30px] bg-gradient-to-br from-primary/20 via-transparent to-foreground/10 blur-3xl" />
            <VideoUrlForm onSubmit={onSubmit} isLoading={isLoading} initialUrl={initialUrl} />
          </div>
        </div>
      </div>
    </section>
  );
}

