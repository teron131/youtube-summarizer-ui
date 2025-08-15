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
    // If no URL provided, return early
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a YouTube URL to process",
        variant: "destructive",
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
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-5xl font-bold text-foreground">
              YouTube Video <span className="text-primary">Summarizer</span>
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

      {/* Processing Status */}
      {isLoading && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 bg-gradient-card border border-muted shadow-card backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary animate-spin" />
                  <h3 className="text-lg font-semibold">Processing Video</h3>
                  <span className="text-sm text-muted-foreground">({currentStage})</span>
                </div>
                
                {processingLogs.length > 0 && (
                  <div className="bg-muted/30 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="space-y-1">
                      {processingLogs.map((log, index) => (
                        <div key={index} className="text-sm text-foreground font-mono">
                          {log}
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
            Powered by advanced AI transcription and summarization technology
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;