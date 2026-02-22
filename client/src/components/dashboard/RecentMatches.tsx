import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, MapPin } from "lucide-react";
import { Link } from "wouter";

interface Match {
  id: number;
  name: string;
  avatar?: string;
  destination: string;
  matchedDate: string;
}

interface RecentMatchesProps {
  matches?: Match[];
}

export default function RecentMatches({ matches = [] }: RecentMatchesProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMatchDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Matched today";
    if (diffInDays === 1) return "Matched yesterday";
    return `Matched ${diffInDays} days ago`;
  };

  if (matches.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Matches</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No matches yet. Start exploring to find travel buddies!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-foreground">Recent Matches</h2>
        <Link href="/match">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View All
          </Button>
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {matches.map((match) => (
          <div
            key={match.id}
            className="flex-shrink-0 w-40 p-4 border border-border rounded-xl hover:bg-muted/50 transition-all duration-300 hover:shadow-md group cursor-pointer"
          >
            <Link href={`/profile/${match.id}`}>
              <div className="flex flex-col items-center text-center mb-3">
                <Avatar className="w-16 h-16 border-2 border-primary/20 mb-3 group-hover:scale-110 transition-transform">
                  <AvatarImage src={match.avatar} alt={match.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(match.name)}
                  </AvatarFallback>
                </Avatar>

                <h3 className="font-semibold text-sm text-foreground truncate w-full group-hover:text-primary transition-colors">
                  {match.name}
                </h3>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 w-full">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{match.destination}</span>
                </div>

                <p className="text-xs text-muted-foreground mt-2">{formatMatchDate(match.matchedDate)}</p>
              </div>
            </Link>

            <Link href={`/messages?userId=${match.id}`}>
              <Button
                size="sm"
                className="w-full text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                Chat
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </Card>
  );
}
