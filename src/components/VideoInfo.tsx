import { Card } from "@/components/ui/card";
import { CalendarDays, Clock, User } from "lucide-react";

interface VideoInfoProps {
  title: string;
  thumbnail?: string;
  author: string;
  duration?: string;
  view_count?: number;
  like_count?: number;
  upload_date?: string;
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
        year: '2-digit',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr; // Fallback to original string if date is invalid
    }
  }
  // Handle ISO 8601 or other standard date strings
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: '2-digit',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return dateStr; // Fallback to original string for other formats
  }
};

const formatDuration = (duration?: string): string | undefined => {
  if (!duration) return undefined;
  // Remove leading "00:" if duration is less than 1 hour
  if (duration.startsWith("00:")) {
    return duration.substring(3);
  }
  return duration;
};

export const VideoInfo = ({ title, thumbnail, author, duration, view_count, like_count, upload_date }: VideoInfoProps) => {
  const displayDuration = formatDuration(duration);
  
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
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{author}</span>
            </div>
            
            {displayDuration && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{displayDuration}</span>
              </div>
            )}
            
            {upload_date && (
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                <span>{formatDate(upload_date)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};