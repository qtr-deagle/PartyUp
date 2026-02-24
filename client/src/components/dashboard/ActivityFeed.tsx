import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Users, MapPin, TrendingUp } from "lucide-react";

interface Activity {
  id: number;
  type: "like" | "join" | "trending" | "review";
  userName?: string;
  userAvatar?: string;
  action: string;
  subject: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities?: Activity[];
}

export default function ActivityFeed({ activities = [] }: ActivityFeedProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "like":
        return Heart;
      case "join":
        return Users;
      case "trending":
        return TrendingUp;
      default:
        return MapPin;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "like":
        return "text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30";
      case "join":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30";
      case "trending":
        return "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30";
      default:
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (activities.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Activity Feed</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No recent activity. Start connecting with travelers!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-foreground">Activity Feed</h2>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const iconColor = getIconColor(activity.type);

          return (
            <div
              key={activity.id}
              className="flex gap-3 p-3 hover:bg-muted/50 rounded-lg transition-all duration-300 group cursor-pointer"
            >
              {activity.userAvatar ? (
                <Avatar className="w-10 h-10 border-2 border-background shrink-0">
                  <AvatarImage src={activity.userAvatar} alt={activity.userName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {activity.userName ? getInitials(activity.userName) : "?"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className={`w-10 h-10 rounded-full ${iconColor} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {activity.userName && (
                    <span className="font-semibold">{activity.userName} </span>
                  )}
                  <span className="text-muted-foreground">{activity.action}</span>
                  {activity.subject && (
                    <span className="font-semibold"> {activity.subject}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {activities.length > 5 && (
        <Button
          variant="ghost"
          className="w-full mt-3 text-sm text-muted-foreground hover:text-primary"
        >
          Load more activities
        </Button>
      )}
    </Card>
  );
}
