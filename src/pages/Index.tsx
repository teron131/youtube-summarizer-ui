import { useState } from "react";
import { VideoUrlForm } from "@/components/VideoUrlForm";
import { VideoInfo } from "@/components/VideoInfo";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { SummaryPanel } from "@/components/SummaryPanel";
import heroBackground from "@/assets/youtube-hero-background.jpg";

interface VideoData {
  title: string;
  thumbnail: string;
  author: string;
  duration: string;
  transcript: string;
  summary: string;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  const handleVideoSubmit = async (url: string) => {
    setIsLoading(true);
    
    // Simulate API call - replace with your actual backend integration
    setTimeout(() => {
      setVideoData({
        title: "How AI Will Transform Software Development in 2024",
        thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=320&h=240&fit=crop",
        author: "Tech Insights",
        duration: "12:34",
        transcript: "Welcome to today's discussion about artificial intelligence and its impact on software development. In this video, we'll explore how AI tools are revolutionizing the way developers write code, debug applications, and optimize performance.\n\nFirst, let's talk about AI-powered code completion. Tools like GitHub Copilot and Tabnine are helping developers write code faster and with fewer errors. These tools use machine learning models trained on billions of lines of code to suggest contextually relevant completions.\n\nNext, we'll discuss automated testing. AI can now generate test cases, identify edge cases that human testers might miss, and even predict which parts of the codebase are most likely to contain bugs.\n\nFinally, we'll look at the future of AI in software development, including autonomous coding systems and AI-powered architecture design.",
        summary: `# AI Transforming Software Development in 2024

This video explores the **revolutionary impact** of artificial intelligence on modern software development practices.

## Key Topics Covered

### 🤖 AI-Powered Code Completion
- **GitHub Copilot** and **Tabnine** are accelerating development
- Intelligent code suggestions based on ML models
- Trained on billions of lines of code for contextual relevance

### 🧪 Automated Testing Revolution
- AI systems generate comprehensive test cases
- Identify overlooked edge cases that humans miss
- **Predictive bug detection** in codebases
- Significant improvement in software quality

### 🚀 Future Developments
- **Autonomous coding systems** on the horizon
- AI-driven architecture design
- Complete integration into development lifecycle

## Key Takeaway

> AI is not replacing developers but **augmenting their capabilities**, making them more productive and enabling focus on higher-level problem-solving and creative aspects of software development.

*The future of coding is collaborative intelligence between humans and AI.*`
      });
      setIsLoading(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              YouTube Video Summarizer
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform any YouTube video into concise, AI-powered summaries. 
              Perfect for learning, research, and content discovery.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <VideoUrlForm onSubmit={handleVideoSubmit} isLoading={isLoading} />
          </div>
        </div>
      </div>

      {/* Results Section */}
      {videoData && (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <VideoInfo
              title={videoData.title}
              thumbnail={videoData.thumbnail}
              author={videoData.author}
              duration={videoData.duration}
            />
            
            <SummaryPanel summary={videoData.summary} />
            
            <TranscriptPanel transcript={videoData.transcript} />
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="border-t border-muted py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Powered by advanced AI transcription and summarization technology
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;