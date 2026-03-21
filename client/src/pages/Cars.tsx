import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import AddVehicleModal from "@/components/AddVehicleModal";
import { Car, Calendar, MessageSquare, TrendingUp, Plus } from "lucide-react";
import { useState } from "react";

/**
 * Cars Page
 * 
 * Travelers can:
 * - List and manage their rental vehicles
 * - View active listings
 * - Track bookings and earnings
 * - Manage messages from renters
 */
export default function Cars() {
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const handleAddVehicle = (vehicle: {
    model: string;
    year: number;
    seats: number;
    pricePerDay: number;
    description: string;
  }) => {
    // Handle adding vehicle
    console.log('Vehicle added:', vehicle);
    setShowAddVehicle(false);
  };
  return (
    <Layout>
      <div className="min-h-screen bg-background p-4 pt-8 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Vehicles</h1>
              <p className="text-sm text-muted-foreground mt-2">Manage your rental vehicles and earn money from travelers</p>
            </div>
            <Button onClick={() => setShowAddVehicle(true)} className="bg-primary text-primary-foreground rounded-xl font-semibold px-6 py-3 transition-all duration-300 hover:shadow-lg active:scale-95 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Vehicle
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 bg-card text-card-foreground rounded-xl shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Active Listings</p>
                  <p className="text-3xl font-bold text-foreground">3</p>
                </div>
                <Car className="w-8 h-8 text-primary opacity-20" />
              </div>
            </Card>

            <Card className="p-6 bg-card text-card-foreground rounded-xl shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Bookings</p>
                  <p className="text-3xl font-bold text-foreground">12</p>
                </div>
                <Calendar className="w-8 h-8 text-secondary opacity-20" />
              </div>
            </Card>

            <Card className="p-6 bg-card text-card-foreground rounded-xl shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Messages</p>
                  <p className="text-3xl font-bold text-foreground">5</p>
                </div>
                <MessageSquare className="w-8 h-8 text-accent opacity-20" />
              </div>
            </Card>

            <Card className="p-6 bg-card text-card-foreground rounded-xl shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Earnings</p>
                  <p className="text-3xl font-bold text-foreground">$2.4K</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary opacity-20" />
              </div>
            </Card>
          </div>

          {/* Vehicles List */}
          <Card className="p-6 md:p-8 bg-card text-card-foreground rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-foreground mb-6">Your Vehicles</h2>
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No vehicles listed yet</p>
              <p className="text-sm text-muted-foreground mb-6">Add your first vehicle to start renting and earning</p>
              <Button onClick={() => setShowAddVehicle(true)} className="bg-primary text-primary-foreground rounded-lg font-semibold px-6 py-2.5">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Vehicle
              </Button>
            </div>
          </Card>
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
