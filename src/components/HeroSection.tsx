import heroBackground from "@/assets/youtube-subtle-background.jpg";
import { ThemeToggle } from "@/components/ThemeToggle";
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

export function HeroSection({ onSubmit, isLoading, initialUrl }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-background/40 to-background" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(255,0,76,0.35),transparent_25%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.12),transparent_35%)]" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 pt-14 pb-20 lg:pb-28">
        <div className="flex flex-col items-center gap-10">
          <div className="space-y-8 w-full max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm fade-in-up">
              <Sparkles className="h-4 w-4" />
              Powered by Gemini, Scrape Creators, Fal
            </div>

            <div className="space-y-4 fade-in-up stagger-1">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-foreground">
                YouTube Video
                <span className="block bg-gradient-to-r from-primary via-primary/80 to-white bg-clip-text text-transparent animate-glow">
                  Structured Analysis
                </span>
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 fade-in-up stagger-2 max-w-5xl mx-auto">
              {[
                { icon: <Zap className="h-4 w-4" />, label: "Fast streaming", value: "< 1 min completion" },
                { icon: <ShieldCheck className="h-4 w-4" />, label: "Structured outputs", value: "Summary, takeaways, chapters" },
                { icon: <Sparkles className="h-4 w-4" />, label: "Multi-model ready", value: "GPT, Gemini, Grok, Claude, more" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-primary/15 bg-background/60 px-6 py-4 shadow-lg hover:border-primary/30 transition-colors duration-300"
                >
                  <div className="flex items-center gap-2 text-primary">
                    {item.icon}
                    <span className="text-xs uppercase tracking-wide">{item.label}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative fade-in-up stagger-3 w-full max-w-4xl">
            <div className="absolute inset-0 -z-10 rounded-[30px] bg-gradient-to-br from-primary/20 via-transparent to-foreground/10 blur-3xl" />
            <VideoUrlForm onSubmit={onSubmit} isLoading={isLoading} initialUrl={initialUrl} />
          </div>
        </div>
      </div>
    </section>
  );
}

