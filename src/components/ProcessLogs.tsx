import { Button } from "@/components/ui/button";
import { classifyLogType, getLogClassName } from "@/lib/video-utils";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useState } from "react";

interface ProcessLogsProps {
  logs: string[];
}

export function ProcessLogs({ logs }: ProcessLogsProps) {
  const [showLogs, setShowLogs] = useState(false);

  if (logs.length === 0) return null;

  return (
    <>
      <div className="mt-2 border-t border-muted/30" />
      <Button
        variant="ghost"
        className="w-full p-6 h-auto justify-between hover:bg-primary/5 transition-all duration-300 whitespace-normal items-start text-left"
        onClick={() => setShowLogs(!showLogs)}
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <span className="text-lg sm:text-xl font-bold text-foreground block break-words">Real-time Logs</span>
            <span className="text-sm sm:text-base text-muted-foreground block break-words">
              Live processing updates with iteration details ({logs.length} entries)
            </span>
          </div>
        </div>
        {showLogs ? (
          <ChevronUp className="w-6 h-6 text-primary" />
        ) : (
          <ChevronDown className="w-6 h-6 text-primary" />
        )}
      </Button>
      
      {showLogs && (
        <div className="px-2 pb-2 pt-0 space-y-4">
          <div className="bg-muted/20 rounded-lg p-4 border border-muted/30 max-h-96 overflow-y-auto">
            <div className="space-y-1 font-mono text-xs text-left">
              {logs.map((log, index) => {
                const logType = classifyLogType(log);
                const logClass = getLogClassName(logType);

                return (
                  <div key={index} className={`${logClass} leading-relaxed break-words whitespace-pre-wrap`}>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

