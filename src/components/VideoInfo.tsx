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

export const VideoInfo = ({ title, thumbnail, author, duration, view_count, like_count, upload_date }: VideoInfoProps) => {
  const displayDuration = duration;
  
  return (
    <Card className="overflow-hidden bg-background/60 border border-border/50 backdrop-blur-sm">
      <div className="p-6">
        {/* Video thumbnail and title section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="flex-shrink-0 relative group">
            <div className="relative overflow-hidden rounded-lg border border-border/30 bg-muted/20">
              <img
                src={thumbnail || "/placeholder.svg"}
                alt={title}
                className="w-full lg:w-56 h-auto lg:h-32 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              {displayDuration && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium">
                  {displayDuration}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 space-y-3">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground line-clamp-3 leading-tight">
              {title}
            </h3>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted/40 rounded-full flex items-center justify-center border border-border/30">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-base font-medium text-foreground/90">{author}</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {view_count && (
            <div className="bg-muted/20 rounded-lg p-3 border border-border/20 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted/40 rounded-md flex items-center justify-center">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Views</div>
                  <div className="text-sm font-semibold text-foreground">{view_count.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {like_count && (
            <div className="bg-muted/20 rounded-lg p-3 border border-border/20 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted/40 rounded-md flex items-center justify-center">
                  <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Likes</div>
                  <div className="text-sm font-semibold text-foreground">{like_count.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {displayDuration && (
            <div className="bg-muted/20 rounded-lg p-3 border border-border/20 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted/40 rounded-md flex items-center justify-center">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Duration</div>
                  <div className="text-sm font-semibold text-foreground">{displayDuration}</div>
                </div>
              </div>
            </div>
          )}
          
          {upload_date && (
            <div className="bg-muted/20 rounded-lg p-3 border border-border/20 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted/40 rounded-md flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Published</div>
                  <div className="text-sm font-semibold text-foreground">{formatDate(upload_date)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};