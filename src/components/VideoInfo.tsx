import { Card } from "@/components/ui/card";
import { cleanVideoUrl } from "@/lib/url-utils";
import { formatDate, formatDuration } from "@/lib/date-utils";
import { s2tw } from "@/lib/utils";
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
  url?: string | null;
  title?: string | null;
  thumbnail?: string | null;
  author?: string | null;
  duration?: string | null;
  view_count?: number | null;
  like_count?: number | null;
  upload_date?: string | null;
}


export const VideoInfo = ({ title, thumbnail, author, duration, view_count, like_count, upload_date, url }: VideoInfoProps) => {
  const displayDuration = formatDuration(duration || undefined);
  const hasMetrics = view_count !== undefined || like_count !== undefined;

  // Convert Chinese characters in video info before displaying
  const convertedInfo = {
    title: title ? s2tw(title) : title,
    author: author ? s2tw(author) : author,
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
            {convertedInfo.title || "Title not available"}
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
            <InfoItem icon={<User className="w-4 h-4 text-primary" />} value={convertedInfo.author || "Author not available"} />

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