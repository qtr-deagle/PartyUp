import React, { useState } from 'react';
import Layout from '@/components/Layout';
import TourBookingPaymentModal from '@/components/TourBookingPaymentModal';
import { MapPin, Clock, Gauge, Users, Star, Phone, MessageCircle, AlertCircle, X, Map } from 'lucide-react';

interface TripDetail {
  id: number;
  pickupLocation: string;
  destination: string;
  eta: string;
  distance: string;
  driver: {
    name: string;
    rating: number;
    verified: boolean;
    avatar: string;
  };
  vehicle: string;
  passengers: {
    current: number;
    max: number;
    list: { name: string; avatar: string }[];
  };
  price?: number;
  type: 'carpool' | 'tour';
}

export default function Trips() {
  const [selectedTrip, setSelectedTrip] = useState<TripDetail | null>({
    id: 1,
    pickupLocation: 'Makati',
    destination: 'Laguna',
    eta: '25 mins',
    distance: '45 km',
    driver: {
      name: 'John Doe',
      rating: 4.8,
      verified: true,
      avatar: 'J',
    },
    vehicle: 'Honda Civic: LFB 4321',
    passengers: {
      current: 1,
      max: 3,
      list: [
        { name: 'Maria Santos', avatar: 'M' },
      ],
    },
    price: 360,
    type: 'carpool',
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!selectedTrip) {
    return (
      <Layout>
        <div className="p-4 md:p-8">
          <p className="text-muted-foreground">No trip selected</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {selectedTrip && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end md:items-center justify-center p-4">
          {/* Modal */}
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto md:rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
              <h2 className="text-lg font-bold text-foreground">Trip Details</h2>
              <button
                onClick={() => setSelectedTrip(null)}
                className="p-1 hover:bg-secondary rounded-lg transition-smooth"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Location Info */}
              <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pick-up</p>
                  <p className="font-semibold text-foreground">{selectedTrip.pickupLocation}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Destination</p>
                  <p className="font-semibold text-foreground">{selectedTrip.destination}</p>
                </div>
              </div>
              </div>
            </div>

            {/* Trip Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">ETA</p>
                </div>
                <p className="font-bold text-foreground">🟢 {selectedTrip.eta}</p>
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Distance</p>
                </div>
                <p className="font-bold text-foreground">{selectedTrip.distance}</p>
              </div>
            </div>

            {/* Driver Info */}
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground mb-3">Driver</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {selectedTrip.driver.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{selectedTrip.driver.name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold">{selectedTrip.driver.rating}</span>
                    {selectedTrip.driver.verified && (
                      <span className="text-xs text-green-600 font-semibold">✓ Verified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Vehicle</p>
              <p className="text-sm font-semibold text-foreground">🚗 {selectedTrip.vehicle}</p>
            </div>

            {/* Price Info */}
            {selectedTrip.price && (
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-xs text-muted-foreground mb-1">Your Contribution</p>
                <p className="text-xl font-bold text-green-600">₱{selectedTrip.price}</p>
              </div>
            )}

            {/* Passengers */}
            <div>
              <p className="text-xs text-muted-foreground mb-3">PASSENGERS ({selectedTrip.passengers.current}/{selectedTrip.passengers.max})</p>
              <div className="space-y-2">
                {selectedTrip.passengers.list.map((passenger, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-secondary rounded">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {passenger.avatar}
                    </div>
                    <span className="text-sm font-medium text-foreground">{passenger.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Action */}
            <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-md transition-smooth">
              <Map className="w-5 h-5" />
              View Live Map
            </button>

            {/* Join Tour Button */}
            {selectedTrip.type === 'tour' && (
              <button 
                onClick={() => setShowPaymentModal(true)}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:shadow-md transition-smooth">
                Join Tour & Book Now
              </button>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button className="flex flex-col items-center gap-2 p-3 hover:bg-secondary rounded-lg transition-smooth flex-1">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-xs text-muted-foreground">Call</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 hover:bg-secondary rounded-lg transition-smooth flex-1">
                <MessageCircle className="w-5 h-5 text-primary" />
                <span className="text-xs text-muted-foreground">Message</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 hover:bg-secondary rounded-lg transition-smooth flex-1">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-xs text-muted-foreground">Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tour Booking Payment Modal */}
      {selectedTrip && selectedTrip.type === 'tour' && (
        <TourBookingPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={() => {
            setShowPaymentModal(false);
            console.log('Tour booking confirmed');
          }}
          tour={{
            title: 'Barcelona City Tour',
            destination: 'Barcelona, Spain',
            dates: '2026-03-15 to 2026-03-20',
            organizer: 'Maria Garcia',
            pricePerPerson: 2500,
            numberOfDays: 5,
            spotsRemaining: 3,
            groupSize: 8,
            paymentDeadline: '2026-02-28',
          }}
        />
      )}
    </Layout>
  );
}
