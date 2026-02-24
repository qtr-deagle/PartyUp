import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { Link } from "wouter";

interface Message {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

interface MessagesPreviewProps {
  messages?: Message[];
}

export default function MessagesPreview({ messages = [] }: MessagesPreviewProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

  const truncateMessage = (message: string, maxLength: number = 40) => {
    return message.length > maxLength ? `${message.slice(0, maxLength)}...` : message;
  };

  if (messages.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Messages</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">No messages yet</p>
          <Link href="/messages">
            <Button variant="outline" size="sm">
              Start a Conversation
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-foreground">Messages</h2>
        <Link href="/messages">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View All
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {messages.slice(0, 3).map((message) => (
          <Link key={message.id} href={`/messages?userId=${message.userId}`}>
            <div className="p-3 border border-border rounded-xl hover:bg-muted/50 transition-all duration-300 hover:shadow-md cursor-pointer group">
              <div className="flex gap-3">
                <div className="relative shrink-0">
                  <Avatar className="w-10 h-10 border-2 border-background">
                    <AvatarImage src={message.userAvatar} alt={message.userName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {getInitials(message.userName)}
                    </AvatarFallback>
                  </Avatar>
                  {message.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {message.userName}
                    </h3>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate flex-1">
                      {truncateMessage(message.lastMessage)}
                    </p>
                    {message.unreadCount > 0 && (
                      <Badge className="ml-2 bg-primary text-primary-foreground min-w-[20px] h-5 rounded-full text-xs flex items-center justify-center px-1.5 animate-pulse">
                        {message.unreadCount > 9 ? "9+" : message.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {messages.length > 3 && (
        <Link href="/messages">
          <Button
            variant="ghost"
            className="w-full mt-3 text-sm text-muted-foreground hover:text-primary"
          >
            View {messages.length - 3} more {messages.length - 3 === 1 ? "message" : "messages"}
          </Button>
        </Link>
      )}
    </Card>
  );
}
