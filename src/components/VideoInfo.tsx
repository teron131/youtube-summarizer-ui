import { Card } from "@/components/ui/card";
import { CalendarDays, Clock, Eye, User } from "lucide-react";

interface VideoInfoProps {
  title: string;
  thumbnail?: string;
  author: string;
  duration?: string;
  view_count?: number;
  upload_date?: string;
}

export const VideoInfo = ({ title, thumbnail, author, duration, view_count, upload_date }: VideoInfoProps) => {
  return (
    <Card className="p-8 modern-blur shadow-glass hover-lift overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-shrink-0 relative">
          <img
            src={thumbnail || "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=320&h=240&fit=crop"}
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
            
            {duration && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">{duration}</span>
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
                    <span className="font-medium">{new Date(upload_date).toLocaleDateString()}</span>
                </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};