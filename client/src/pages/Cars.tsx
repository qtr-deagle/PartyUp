import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import AddVehicleModal from "@/components/AddVehicleModal";
import { Car, Plus, MapPin, Star, Clock, Fuel, Users } from "lucide-react";
import { useState } from "react";

/**
 * My Vehicles Page
 * 
 * Travelers can:
 * - Track their personal vehicles
 * - Use vehicles for carpooling trips
 * - Maintain vehicle information
 * - Share vehicle details with carpool buddies
 */
export default function Cars() {
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const handleAddVehicle = (vehicle: {
    model: string;
    year: number;
    seats: number;
    description: string;
  }) => {
    // Handle adding vehicle
    console.log('Vehicle added:', vehicle);
    setShowAddVehicle(false);
  };

  const vehicles = [
    {
      id: 1,
      model: 'Toyota Camry 2023',
      year: 2023,
      seats: 5,
      fuel: 'Hybrid',
      transmission: 'Automatic',
      color: 'Pearl White',
      rating: 4.9,
      reviews: 28,
      responseTime: '2 hours',
      images: 3,
      photo: '🚗',
    },
    {
      id: 2,
      model: 'Honda CR-V 2022',
      year: 2022,
      seats: 7,
      fuel: 'Gasoline',
      transmission: 'Automatic',
      color: 'Black',
      rating: 4.8,
      reviews: 19,
      responseTime: '1 hour',
      images: 4,
      photo: '🚙',
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background p-4 pt-8 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Vehicles</h1>
              <p className="text-sm text-muted-foreground mt-2">Track your personal vehicles for carpooling and trips</p>
            </div>
            <Button onClick={() => setShowAddVehicle(true)} className="bg-primary text-primary-foreground rounded-xl font-semibold px-6 py-3 transition-all duration-300 hover:shadow-lg active:scale-95 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Vehicle
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Card className="p-4 bg-card text-card-foreground rounded-xl shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">My Vehicles</p>
                  <p className="text-2xl font-bold text-foreground">2</p>
                </div>
                <Car className="w-6 h-6 text-primary opacity-20" />
              </div>
            </Card>

            <Card className="p-4 bg-card text-card-foreground rounded-xl shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Trips Used</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                </div>
                <Users className="w-6 h-6 text-secondary opacity-20" />
              </div>
            </Card>
          </div>

          {/* Vehicles List */}
          <div className="space-y-4">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="p-4 bg-card text-card-foreground rounded-xl shadow-md hover:shadow-lg transition-all">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Vehicle Photo */}
                  <div className="md:col-span-1 flex items-center justify-center">
                    <div className="w-20 h-20 bg-secondary/50 rounded-lg flex items-center justify-center p-1 flex-shrink-0">
                      <div className="text-3xl">{vehicle.photo}</div>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="md:col-span-3 space-y-1.5">
                    {/* Title & Rating */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-foreground">{vehicle.model}</h3>
                        <div className="flex items-center gap-1.5 mt-0">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-600 dark:text-yellow-400" />
                          <span className="font-semibold text-yellow-600 dark:text-yellow-400 text-xs">{vehicle.rating}</span>
                          <span className="text-xs text-muted-foreground">({vehicle.reviews} trips)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">Ready</p>
                        <p className="text-xs text-muted-foreground leading-none">for carpooling</p>
                      </div>
                    </div>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                      <div className="p-2 bg-secondary/30 border border-border rounded-lg">
                        <p className="text-xs text-muted-foreground leading-none">Seats</p>
                        <p className="font-semibold text-foreground text-xs flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3" /> {vehicle.seats}
                        </p>
                      </div>
                      <div className="p-2 bg-secondary/30 border border-border rounded-lg">
                        <p className="text-xs text-muted-foreground leading-none">Transmission</p>
                        <p className="font-semibold text-foreground text-xs">{vehicle.transmission}</p>
                      </div>
                      <div className="p-2 bg-secondary/30 border border-border rounded-lg">
                        <p className="text-xs text-muted-foreground leading-none">Fuel</p>
                        <p className="font-semibold text-foreground text-xs flex items-center gap-1 mt-0.5">
                          <Fuel className="w-3 h-3" /> {vehicle.fuel}
                        </p>
                      </div>
                      <div className="p-2 bg-secondary/30 border border-border rounded-lg">
                        <p className="text-xs text-muted-foreground leading-none">Color</p>
                        <p className="font-semibold text-foreground text-xs">{vehicle.color}</p>
                      </div>
                    </div>

                    {/* Response Time */}
                    <div className="p-2 bg-accent/10 border border-accent/30 rounded-lg">
                      <p className="text-xs text-muted-foreground leading-none flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Response Time
                      </p>
                      <p className="font-semibold text-foreground text-xs mt-0.5">Typically replies in {vehicle.responseTime}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button className="flex-1 py-2 px-3 bg-primary text-primary-foreground rounded-lg text-xs font-medium transition-smooth hover:bg-primary/90">
                        Edit
                      </button>
                      <button className="flex-1 py-2 px-3 bg-secondary text-foreground rounded-lg text-xs font-medium transition-smooth hover:bg-secondary/80">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={showAddVehicle}
        onClose={() => setShowAddVehicle(false)}
        onSubmit={handleAddVehicle}
      />
    </Layout>
  );
}
