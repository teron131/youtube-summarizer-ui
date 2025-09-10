import { Card } from "@/components/ui/card";
import { CalendarDays, Clock, Eye, ThumbsUp, User } from "lucide-react";
import { ReactNode } from "react";

// Helper component for info items
interface InfoItemProps {
  icon: ReactNode;
  value: string;
}

const InfoItem = ({ icon, value }: InfoItemProps) => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
      {icon}
    </div>
    <span className="font-medium">{value}</span>
  </div>
);

interface VideoInfoProps {
  url?: string;
  title: string | null;
  thumbnail?: string;
  author: string | null;
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
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return dateStr; // Fallback to original string for other formats
  }
};

const formatDuration = (duration?: string): string | null => {
  if (!duration) return null;
  // Remove leading 00: if hours are zero
  return duration.replace(/^0{1,2}:/, "");
};

export const VideoInfo = ({ title, thumbnail, author, duration, view_count, like_count, upload_date, url }: VideoInfoProps) => {
  const displayDuration = formatDuration(duration || undefined);
  const hasMetrics = view_count !== undefined || like_count !== undefined;
  
  const cleanVideoUrl = (input?: string): string | null => {
    if (!input) return null;
    try {
      const u = new URL(input);
      const host = u.hostname.replace(/^www\./, "");
      if (host.includes("youtube.com")) {
        const v = u.searchParams.get("v");
        if (v) return `https://www.youtube.com/watch?v=${v}`;
        return `https://www.${host}${u.pathname}`;
      }
      if (host === "youtu.be") {
        const id = u.pathname.replace(/^\//, "");
        return id ? `https://www.youtube.com/watch?v=${id}` : "https://www.youtube.com";
      }
      return `https://www.${host}${u.pathname}`;
    } catch (e) {
      return input.replace(/^https?:\/\//, "").replace(/^www\./, "");
    }
  };

  const cleanedUrl = cleanVideoUrl(url);

  return (
    <Card className="p-8 modern-blur shadow-glass hover-lift overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-shrink-0 relative" style={{ aspectRatio: "16 / 9" }}>
          <img
            src={thumbnail || "/placeholder.svg"}
            alt={title || "Video thumbnail"}
            className="w-full sm:w-64 md:w-80 h-full object-cover rounded-xl shadow-lg border-2 border-primary/20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
        </div>
        
        <div className="flex-1 space-y-4">
          <h3 className="text-2xl font-bold text-foreground line-clamp-2 leading-tight">
            {title || "Title not available"}
          </h3>
          {cleanedUrl && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline break-all"
            >
              {cleanedUrl}
            </a>
          )}
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-muted-foreground">
            <InfoItem icon={<User className="w-4 h-4 text-primary" />} value={author || "Author not available"} />

            {displayDuration && (
              <InfoItem icon={<Clock className="w-4 h-4 text-primary" />} value={displayDuration} />
            )}

            {upload_date && (
              <InfoItem icon={<CalendarDays className="w-4 h-4 text-primary" />} value={formatDate(upload_date)!} />
            )}

            {hasMetrics && <div className="basis-full" />}

            {view_count !== undefined && (
              <InfoItem icon={<Eye className="w-4 h-4 text-primary" />} value={view_count.toLocaleString()} />
            )}

            {like_count !== undefined && (
              <InfoItem icon={<ThumbsUp className="w-4 h-4 text-primary" />} value={like_count.toLocaleString()} />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};