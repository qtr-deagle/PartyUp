import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, MessageCircle, User } from "lucide-react";
import { Link } from "wouter";

interface TravelBuddy {
  id: number;
  name: string;
  avatar?: string;
  destination: string;
  travelDates: string;
  matchPercentage: number;
  isOnline: boolean;
}

interface SuggestedBuddiesProps {
  buddies?: TravelBuddy[];
}

export default function SuggestedBuddies({ buddies = [] }: SuggestedBuddiesProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-accent dark:text-accent";
    if (percentage >= 60) return "text-primary dark:text-primary";
    return "text-yellow-600 dark:text-yellow-400";
  };

  if (buddies.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Suggested Travel Buddies</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No suggestions yet. Create a trip to find travel buddies!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-foreground">Suggested Travel Buddies</h2>
        <Link href="/discovery">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View All
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {buddies.map((buddy) => (
          <div
            key={buddy.id}
            className="p-4 border border-border rounded-xl hover:bg-muted/50 transition-all duration-300 hover:shadow-md group"
          >
            <div className="flex gap-3">
              <div className="relative">
                <Avatar className="w-12 h-12 border-2 border-background">
                  <AvatarImage src={buddy.avatar} alt={buddy.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(buddy.name)}
                  </AvatarFallback>
                </Avatar>
                {buddy.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {buddy.name}
                  </h3>
                  <span className={`text-sm font-bold ${getMatchColor(buddy.matchPercentage)}`}>
                    {buddy.matchPercentage}% Match
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{buddy.destination}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{buddy.travelDates}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/profile/${buddy.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      View Profile
                    </Button>
                  </Link>
                  <Link href={`/messages?userId=${buddy.id}`} className="flex-1">
                    <Button
                      size="sm"
                      className="w-full text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Chat
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
