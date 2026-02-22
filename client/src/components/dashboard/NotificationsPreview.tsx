import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, MessageCircle, UserPlus, Calendar } from "lucide-react";
import { Link } from "wouter";

interface Notification {
  id: number;
  type: "trip" | "message" | "match" | "booking";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationsPreviewProps {
  notifications?: Notification[];
}

export default function NotificationsPreview({ notifications = [] }: NotificationsPreviewProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "trip":
        return Calendar;
      case "message":
        return MessageCircle;
      case "match":
        return UserPlus;
      case "booking":
        return CheckCircle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "trip":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30";
      case "message":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      case "match":
        return "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30";
      case "booking":
        return "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30";
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (notifications.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Notifications</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Bell className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No notifications yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          Notifications
          {unreadCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 animate-pulse">
              {unreadCount}
            </span>
          )}
        </h2>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
          View All
        </Button>
      </div>

      <div className="space-y-2">
        {notifications.slice(0, 3).map((notification) => {
          const Icon = getNotificationIcon(notification.type);
          const colorClasses = getNotificationColor(notification.type);

          return (
            <div
              key={notification.id}
              className={`p-3 border rounded-lg transition-all duration-300 cursor-pointer hover:shadow-md ${
                notification.isRead
                  ? "border-border bg-background"
                  : "border-primary/20 bg-primary/5"
              }`}
            >
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-lg ${colorClasses} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                </div>

                {!notification.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {notifications.length > 3 && (
        <Button variant="ghost" className="w-full mt-3 text-sm text-muted-foreground hover:text-primary">
          View {notifications.length - 3} more {notifications.length - 3 === 1 ? "notification" : "notifications"}
        </Button>
      )}
    </Card>
  );
}
