import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Calendar, MessageSquare, TrendingUp } from "lucide-react";
import Weather from "@/components/Weather";

export default function CarRenterDashboard() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Your Fleet</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-card text-card-foreground rounded-xl shadow-md p-4">
            <Car className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Active Listings</p>
            <p className="text-2xl font-bold text-foreground">3</p>
          </Card>
          <Card className="p-6 bg-card text-card-foreground rounded-xl shadow-md p-4">
            <Calendar className="w-5 h-5 text-secondary mb-2" />
            <p className="text-sm text-muted-foreground">Bookings</p>
            <p className="text-2xl font-bold text-foreground">12</p>
          </Card>
          <Card className="p-6 bg-card text-card-foreground rounded-xl shadow-md p-4">
            <MessageSquare className="w-5 h-5 text-accent mb-2" />
            <p className="text-sm text-muted-foreground">Messages</p>
            <p className="text-2xl font-bold text-foreground">5</p>
          </Card>
          <Card className="p-6 bg-card text-card-foreground rounded-xl shadow-md p-4">
            <TrendingUp className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Earnings</p>
            <p className="text-2xl font-bold text-foreground">$2.4K</p>
          </Card>
        </div>

        <Button className="bg-primary text-primary-foreground rounded-xl font-semibold px-6 py-2.5 transition-all duration-300 hover:shadow-lg active:scale-95 mb-8">Add New Vehicle</Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="p-6 bg-card text-card-foreground rounded-xl shadow-md p-4">
            <h2 className="text-xl font-bold text-foreground mb-4">Your Vehicles</h2>
            <p className="text-muted-foreground">No vehicles listed yet. Add your first vehicle to get started!</p>
          </Card>
          <Weather />
        </div>
      </div>
    </div>
  );
}
