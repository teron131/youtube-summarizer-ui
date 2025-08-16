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
    <Card className="p-8 modern-blur shadow-glass hover-lift overflow-hidden">
      <div className="flex gap-6">
        <div className="flex-shrink-0 relative">
          <img
            src={thumbnail}
            alt={title}
            className="w-40 h-28 object-cover rounded-xl shadow-lg border border-primary/20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
        </div>
        
        <div className="flex-1 space-y-4">
          <h3 className="text-2xl font-bold text-foreground line-clamp-2 leading-tight">
            {title}
          </h3>
          
          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">{author}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">{duration}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};