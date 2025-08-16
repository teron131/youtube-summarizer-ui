import { useState } from "react";
import { VideoUrlForm } from "@/components/VideoUrlForm";
import { VideoInfo } from "@/components/VideoInfo";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { SummaryPanel } from "@/components/SummaryPanel";
import { useToast } from "@/hooks/use-toast";
import { processVideo, isValidYouTubeUrl, handleApiError, ProcessingData } from "@/services/api";
import { Card } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import heroBackground from "@/assets/youtube-subtle-background.jpg";

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
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [currentStage, setCurrentStage] = useState<string>("");
  const { toast } = useToast();

  const handleVideoSubmit = async (url: string) => {
    // If no URL provided, show example output
    if (!url.trim()) {
      setVideoData({
        title: "How to Build React Apps with TypeScript - Complete Tutorial",
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=480&h=360&fit=crop",
        author: "Tech Tutorial Channel",
        duration: "25:42",
        transcript: `Welcome to this comprehensive tutorial on building React applications with TypeScript. 

In this video, we'll cover:

1. Setting up a React TypeScript project
   - Installing dependencies
   - Configuring TypeScript
   - Setting up development environment

2. Creating Components with TypeScript
   - Defining prop types
   - Using interfaces and type definitions
   - Component state management

3. Advanced TypeScript Features
   - Generic components
   - Custom hooks with types
   - Error handling patterns

4. Best Practices
   - Code organization
   - Testing strategies
   - Performance optimization

Let's start by creating our first TypeScript React component. We'll begin with a simple counter component that demonstrates basic type safety...

[Additional transcript content continues with detailed explanations of React TypeScript concepts, code examples, and practical implementation tips.]`,
        summary: `This comprehensive tutorial covers building React applications with TypeScript from setup to deployment.

**Key Topics Covered:**

🔧 **Project Setup**
- Installing React with TypeScript template
- Configuring development environment
- Essential dependencies and tools

💻 **Component Development**
- Creating type-safe React components
- Defining interfaces for props and state
- Using TypeScript generics effectively

🎯 **Advanced Patterns**
- Custom hooks with proper typing
- Context API with TypeScript
- Error boundaries and error handling

🚀 **Best Practices**
- Code organization strategies
- Testing TypeScript React components
- Performance optimization techniques

**Main Benefits Highlighted:**
- Enhanced developer experience with autocomplete
- Compile-time error detection
- Better code maintainability and refactoring
- Improved team collaboration

The tutorial provides practical examples and real-world scenarios, making it ideal for developers transitioning from JavaScript to TypeScript in React projects.`
      });
      setCurrentStage("Completed");
      
      toast({
        title: "Example Output",
        description: "This is a sample output. Enter a YouTube URL to process real videos.",
      });
      return;
    }

    // Validate YouTube URL format
    if (!isValidYouTubeUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setVideoData(null);
    setProcessingLogs([]);
    setCurrentStage("Starting...");

    try {
      const response = await processVideo(url, true);
      
      if (response.status === 'success' && response.data) {
        const data = response.data;
        
        // Transform API response to match component interface
        setVideoData({
          title: data.title,
          thumbnail: data.thumbnail || "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=320&h=240&fit=crop",
          author: data.author,
          duration: data.duration || "Unknown",
          transcript: data.transcript,
          summary: data.summary || "Summary not available",
        });

        setProcessingLogs(response.logs);
        setCurrentStage("Completed");

        toast({
          title: "Processing Complete!",
          description: `Video processed successfully in ${data.processing_time}`,
        });
      } else {
        throw new Error(response.message || 'Processing failed');
      }
    } catch (error) {
      const apiError = handleApiError(error);
      
      toast({
        title: "Processing Failed",
        description: apiError.message,
        variant: "destructive",
      });

      setCurrentStage("Failed");
      // Improved error logging for better debugging
      console.error('Processing error:', apiError.message, 'Details:', apiError.details);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden min-h-screen flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center space-y-8 mb-16">
            <div className="fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-primary text-sm font-medium">Powered by Advanced AI</span>
              </div>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black text-foreground fade-in-up stagger-1">
              YouTube
              <br />
              <span className="text-primary animate-glow bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Summarizer
              </span>
            </h1>
            
            <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed fade-in-up stagger-2">
              Transform any YouTube video into concise, intelligent summaries. 
              <br />
              <span className="text-primary font-semibold">Advanced AI transcription</span> meets 
              <span className="text-primary font-semibold"> smart analysis</span> for instant insights.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground fade-in-up stagger-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>Real-time Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>High Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>Multiple Formats</span>
              </div>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto fade-in-up stagger-4">
            <VideoUrlForm onSubmit={handleVideoSubmit} isLoading={isLoading} />
          </div>
        </div>
      </div>

      {/* Modern Processing Status */}
      {isLoading && (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Card className="p-10 modern-blur shadow-glass">
              <div className="space-y-8">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Clock className="w-10 h-10 text-white animate-spin" />
                    </div>
                    <div className="absolute inset-0 w-20 h-20 bg-primary/30 rounded-full animate-ping"></div>
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-bold text-foreground">Processing Video</h3>
                  <p className="text-xl text-muted-foreground">({currentStage})</p>
                  <div className="w-full bg-muted/30 rounded-full h-2 mt-4">
                    <div className="bg-gradient-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
                
                {processingLogs.length > 0 && (
                  <div className="glass-effect rounded-2xl p-6 max-h-64 overflow-y-auto border border-primary/10">
                    <div className="space-y-2">
                      {processingLogs.map((log, index) => (
                        <div key={index} className="text-sm text-foreground font-mono opacity-80">
                          → {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Error State */}
      {currentStage === "Failed" && !isLoading && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 bg-gradient-card border border-destructive shadow-card backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <h3 className="text-lg font-semibold text-destructive">Processing Failed</h3>
              </div>
              
              {processingLogs.length > 0 && (
                <div className="mt-4 bg-muted/30 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <div className="space-y-1">
                    {processingLogs.map((log, index) => (
                      <div key={index} className="text-sm text-foreground font-mono">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Results Section */}
      {videoData && currentStage === "Completed" && (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Processing completed successfully!</span>
            </div>
            
            <VideoInfo
              title={videoData.title}
              thumbnail={videoData.thumbnail}
              author={videoData.author}
              duration={videoData.duration}
            />
            
            <SummaryPanel summary={videoData.summary} />
            
            <TranscriptPanel transcript={videoData.transcript} />

            {/* Processing Logs */}
            {processingLogs.length > 0 && (
              <Card className="bg-gradient-card border border-muted shadow-card backdrop-blur-sm">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Processing Log</h3>
                  <div className="bg-muted/30 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="space-y-1">
                      {processingLogs.map((log, index) => (
                        <div key={index} className="text-sm text-muted-foreground font-mono">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="border-t border-muted py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Powered by Whisper and Gemini
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;