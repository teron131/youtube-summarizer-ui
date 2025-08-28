import { Card } from "@/components/ui/card";
import { CalendarDays, Clock, Eye, ThumbsUp, User } from "lucide-react";

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
      return dateStr;
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
    return dateStr;
  }
};

export const VideoInfo = ({ title, thumbnail, author, duration, view_count, like_count, upload_date }: VideoInfoProps) => {
  const displayDuration = duration;
  
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border border-primary/10 backdrop-blur-xl">
      <div className="p-6">
        {/* Video thumbnail and title section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="flex-shrink-0 relative group">
            <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <img
                src={thumbnail || "/placeholder.svg"}
                alt={title}
                className="w-full lg:w-80 h-auto lg:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              {displayDuration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-sm px-2 py-1 rounded-md font-medium">
                  {displayDuration}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 space-y-3">
            <h3 className="text-2xl lg:text-3xl font-black text-foreground line-clamp-3 leading-tight tracking-tight">
              {title}
            </h3>
            
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium">{author}</span>
              </div>
              {displayDuration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{displayDuration}</span>
                </div>
              )}
              {upload_date && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>{formatDate(upload_date)}</span>
                </div>
              )}
              {view_count && (
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{view_count.toLocaleString()}</span>
                </div>
              )}
              {like_count && (
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{like_count.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </Card>
  );
};