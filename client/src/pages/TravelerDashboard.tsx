import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Car, Heart } from "lucide-react";
import Weather from "@/components/Weather";

export default function TravelerDashboard() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, Traveler!</h1>
          <p className="text-muted-foreground">Find your next adventure and travel companion</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-card text-card-foreground rounded-xl shadow-md p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Find Buddy</h3>
            <p className="text-xs text-muted-foreground">Match with travelers</p>
          </Card>
          <Card className="p-6 bg-card text-card-foreground rounded-xl shadow-md p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Car Pool</h3>
            <p className="text-xs text-muted-foreground">Join or create trips</p>
          </Card>
          <Card className="p-6 bg-card text-card-foreground rounded-xl shadow-md p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-3">
              <Car className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Rent Car</h3>
            <p className="text-xs text-muted-foreground">Browse vehicles</p>
          </Card>
          <Card className="p-6 bg-card text-card-foreground rounded-xl shadow-md p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Nearby</h3>
            <p className="text-xs text-muted-foreground">Discover nearby users</p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Weather Widget */}
          <div>
            <Weather />
          </div>

          {/* Upcoming Trips */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-card text-card-foreground rounded-xl shadow-md p-4">
              <h2 className="text-xl font-bold text-foreground mb-4">Upcoming Trips</h2>
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">New York to Boston</h3>
                      <p className="text-sm text-muted-foreground">March 15, 2026</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground">2 travelers joined • 2 seats available</p>
                </div>
              </div>
              <Button className="w-full mt-4 bg-primary text-primary-foreground rounded-xl font-semibold px-6 py-2.5 transition-all duration-300 hover:shadow-lg active:scale-95">Create New Trip</Button>
            </Card>
          </div>

          {/* Nearby Travelers */}
          <div>
            <Card className="p-6 bg-card text-card-foreground rounded-xl shadow-md p-4">
              <h2 className="text-lg font-bold text-foreground mb-4">Nearby Travelers</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                        {String.fromCharCode(64 + i)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">Traveler {i}</p>
                        <p className="text-xs text-muted-foreground">2.5 km away</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
