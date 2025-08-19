import { Card } from "@/components/ui/card";
import { CalendarDays, Clock, Eye, User } from "lucide-react";

interface VideoInfoProps {
  title: string;
  thumbnail?: string;
  author: string;
  duration?: string;
  duration_seconds?: number;
  view_count?: number;
  upload_date?: string;
}

const formatDuration = (seconds?: number): string | null => {
  if (seconds === undefined || seconds === null) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (h > 0) parts.push(h.toString().padStart(2, '0'));
  parts.push(m.toString().padStart(2, '0'));
  parts.push(s.toString().padStart(2, '0'));
  
  return parts.join(':');
}

const formatDate = (dateStr?: string): string | null => {
  if (!dateStr) return null;
  // Handle YYYYMMDD format
  if (/^\d{8}$/.test(dateStr)) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    try {
      return new Date(`${year}-${month}-${day}`).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr; // Fallback to original string if date is invalid
    }
  }
  // Handle ISO 8601 or other standard date strings
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return dateStr; // Fallback to original string for other formats
  }
};

export const VideoInfo = ({ title, thumbnail, author, duration, duration_seconds, view_count, upload_date }: VideoInfoProps) => {
  const displayDuration = duration_seconds ? formatDuration(duration_seconds) : duration;
  
  return (
    <Card className="p-8 modern-blur shadow-glass hover-lift overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-shrink-0 relative">
          <img
            src={thumbnail || "/placeholder.svg"}
            alt={title}
            className="w-full sm:w-40 h-auto sm:h-28 object-cover rounded-xl shadow-lg border border-primary/20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
        </div>
        
        <div className="flex-1 space-y-4">
          <h3 className="text-2xl font-bold text-foreground line-clamp-2 leading-tight">
            {title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">{author}</span>
            </div>
            
            {displayDuration && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">{displayDuration}</span>
              </div>
            )}
            
            {view_count && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <Eye className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">{view_count.toLocaleString()} views</span>
              </div>
            )}
            
            {upload_date && (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <CalendarDays className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">{formatDate(upload_date)}</span>
                </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};