import { Card } from "@/components/ui/card";
import { Clock, User } from "lucide-react";

interface VideoInfoProps {
  title: string;
  thumbnail: string;
  author: string;
  duration: string;
}

export const VideoInfo = ({ title, thumbnail, author, duration }: VideoInfoProps) => {
  return (
    <Card className="p-6 bg-gradient-card border border-muted shadow-card backdrop-blur-sm">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <img
            src={thumbnail}
            alt={title}
            className="w-32 h-24 object-cover rounded-lg shadow-md"
          />
        </div>
        
        <div className="flex-1 space-y-3">
          <h3 className="text-xl font-semibold text-foreground line-clamp-2">
            {title}
          </h3>
          
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span className="text-sm">{author}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{duration}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};