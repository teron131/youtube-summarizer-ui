import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError, StreamingProgressState } from "@/services/types";
import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  error: ApiError;
  progressStates: StreamingProgressState[];
  onLoadExample: () => void;
}

export function ErrorDisplay({ error, progressStates, onLoadExample }: ErrorDisplayProps) {
  return (
    <Card className="p-6 bg-gradient-card border border-destructive shadow-card backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-destructive mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-destructive mb-2">{error.message}</h3>
          
          {/* Error type and status */}
          <div className="flex items-center gap-4 mb-3 text-base">
            {error.type && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                error.type === 'server' ? 'bg-red-100 text-red-800' :
                error.type === 'validation' ? 'bg-yellow-100 text-yellow-800' :
                error.type === 'network' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {error.type.toUpperCase()}
              </span>
            )}
            {error.status && (
              <span className="text-muted-foreground">
                Status: {error.status}
              </span>
            )}
          </div>
          
          {/* Error details */}
          {error.details && (
            <div className="bg-muted/30 rounded-lg p-3 mb-3">
              <p className="text-base text-muted-foreground mb-1">Technical Details:</p>
              <p className="text-xs font-mono text-foreground break-all">{error.details}</p>
            </div>
          )}
          
          {/* Progress details if available */}
          {progressStates.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-semibold text-base">Progress Details:</h4>
              <div className="bg-muted/30 rounded-lg p-4 max-h-48 overflow-y-auto">
                {progressStates.map((state, index) => (
                  <div key={index} className="text-base text-foreground font-mono mb-2">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      state.status === 'completed' ? 'bg-green-500' :
                      state.status === 'error' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`} />
                    Step {state.step}: {state.message}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Configuration suggestions */}
          {error.message.includes('SCRAPECREATORS_API_KEY') && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-base text-blue-800">
                <strong>Configuration Issue:</strong> The Scrape Creators API key is not configured on the backend server. 
                Please contact the administrator to configure the required API keys.
              </p>
            </div>
          )}
          
          {error.message.includes('GEMINI_API_KEY') && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-base text-blue-800">
                <strong>Configuration Issue:</strong> The Gemini API key is not configured on the backend server. 
                Please contact the administrator to configure the required API keys.
              </p>
            </div>
          )}

          {/* Fallback action */}
          <div className="mt-4 flex gap-3">
            <Button onClick={onLoadExample} className="bg-primary text-white">
              Load example data
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

