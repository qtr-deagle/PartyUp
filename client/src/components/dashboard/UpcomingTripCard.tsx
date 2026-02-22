import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { Link } from "wouter";

interface Trip {
  id: number;
  destination: string;
  origin: string;
  departureDate: string;
  returnDate?: string;
  buddiesCount: number;
  seatsAvailable?: number;
  status: "upcoming" | "active" | "completed";
}

interface UpcomingTripCardProps {
  trip?: Trip;
  onCreateTrip?: () => void;
}

export default function UpcomingTripCard({ trip, onCreateTrip }: UpcomingTripCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "completed":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (!trip) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-dashed border-2 border-primary/20">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Active Trip</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Start your next adventure by creating a trip
          </p>
          <Button
            onClick={onCreateTrip}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold px-6 py-2.5 transition-all duration-300 hover:shadow-lg active:scale-95"
          >
            Create Trip
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card hover:shadow-lg transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              {trip.destination}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">From {trip.origin}</p>
        </div>
        <Badge className={`${getStatusColor(trip.status)} capitalize font-medium px-3 py-1`}>
          {trip.status}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            {formatDate(trip.departureDate)}
            {trip.returnDate && ` - ${formatDate(trip.returnDate)}`}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>
            {trip.buddiesCount} {trip.buddiesCount === 1 ? "buddy" : "buddies"} joined
            {trip.seatsAvailable && ` • ${trip.seatsAvailable} seats available`}
          </span>
        </div>
      </div>

      <Link href={`/trips/${trip.id}`}>
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold transition-all duration-300 hover:shadow-md active:scale-95">
          View Trip Details
        </Button>
      </Link>
    </Card>
  );
}
