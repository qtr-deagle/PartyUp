import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation } from "lucide-react";
import { Link } from "wouter";

interface NearbyTraveler {
  id: number;
  name: string;
  avatar?: string;
  destination?: string;
  distance: number; // in km
  isOnline: boolean;
  travelingSoon?: boolean;
}

interface NearbyTravelersProps {
  travelers?: NearbyTraveler[];
}

export default function NearbyTravelers({ travelers = [] }: NearbyTravelersProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)} km away`;
  };

  if (travelers.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary" />
          Nearby Travelers
        </h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            No travelers nearby at the moment
          </p>
          <p className="text-xs text-muted-foreground">
            Enable location to discover travelers around you
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary" />
          Nearby Travelers
        </h2>
        <Link href="/map">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View Map
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {travelers.map((traveler) => (
          <Link key={traveler.id} href={`/profile/${traveler.id}`}>
            <div className="p-3 border border-border rounded-xl hover:bg-muted/50 transition-all duration-300 hover:shadow-md cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <Avatar className="w-12 h-12 border-2 border-background">
                    <AvatarImage src={traveler.avatar} alt={traveler.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {getInitials(traveler.name)}
                    </AvatarFallback>
                  </Avatar>
                  {traveler.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {traveler.name}
                    </h3>
                    {traveler.travelingSoon && (
                      <Badge className="bg-primary/10 text-primary text-xs px-2 py-0.5">
                        Traveling Soon
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDistance(traveler.distance)}
                      </span>
                    </div>
                    {traveler.destination && (
                      <p className="text-xs text-muted-foreground truncate">
                        Going to {traveler.destination}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {travelers.length > 5 && (
        <Link href="/map">
          <Button
            variant="ghost"
            className="w-full mt-3 text-sm text-muted-foreground hover:text-primary"
          >
            View {travelers.length - 5} more nearby travelers
          </Button>
        </Link>
      )}
    </Card>
  );
}
