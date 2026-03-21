import React, { useState } from 'react';
import { X, Car, Users } from 'lucide-react';
import { useLocation } from 'wouter';

interface CreateRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ride: {
    from: string;
    to: string;
    date: string;
    time: string;
    seats: number;
    costPerSeat: number;
    description: string;
  }) => void;
}

export default function CreateRideModal({ isOpen, onClose, onSubmit }: CreateRideModalProps) {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'choice' | 'form'>('choice');
  const [rideType, setRideType] = useState<'carpool' | 'rental' | null>(null);
  const [ride, setRide] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    seats: 3,
    costPerSeat: 0,
    description: '',
  });

  const handleSubmit = () => {
    if (ride.from && ride.to && ride.date && ride.time && ride.costPerSeat > 0) {
      onSubmit(ride);
      setRide({
        from: '',
        to: '',
        date: '',
        time: '',
        seats: 3,
        costPerSeat: 0,
        description: '',
      });
      setStep('choice');
    }
  };

  const handleClose = () => {
    setRide({
      from: '',
      to: '',
      date: '',
      time: '',
      seats: 3,
      costPerSeat: 0,
      description: '',
    });
    setStep('choice');
    setRideType(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {step === 'choice' ? 'What do you want to do?' : 'Share Your Ride'}
              </h2>
              {step === 'form' && (
                <p className="text-xs text-muted-foreground mt-1">
                  {rideType === 'carpool' 
                    ? 'Help fellow travelers reach their destination' 
                    : 'Rent your car to verified travelers'}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-secondary rounded-lg transition-smooth"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'choice' ? (
              <div className="space-y-4">
                {/* Carpool Option */}
                <button
                  onClick={() => {
                    setRideType('carpool');
                    setStep('form');
                  }}
                  className="w-full p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Share a Ride</h3>
                      <p className="text-sm text-muted-foreground">
                        Post a trip and carpool with other travelers
                      </p>
                    </div>
                  </div>
                </button>

                {/* Rental Option */}
                <button
                  onClick={() => {
                    setRideType('rental');
                    setStep('form');
                  }}
                  className="w-full p-6 border-2 border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-all text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Rent Your Car</h3>
                      <p className="text-sm text-muted-foreground">
                        List your vehicle and earn money
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {rideType === 'carpool' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        From *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Makati"
                        value={ride.from}
                        onChange={(e) => setRide({ ...ride, from: e.target.value })}
                        className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        To *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Tagaytay"
                        value={ride.to}
                        onChange={(e) => setRide({ ...ride, to: e.target.value })}
                        className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Date *
                        </label>
                        <input
                          type="date"
                          value={ride.date}
                          onChange={(e) => setRide({ ...ride, date: e.target.value })}
                          className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Time *
                        </label>
                        <input
                          type="time"
                          value={ride.time}
                          onChange={(e) => setRide({ ...ride, time: e.target.value })}
                          className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Available Seats
                        </label>
                        <select
                          value={ride.seats}
                          onChange={(e) => setRide({ ...ride, seats: parseInt(e.target.value) })}
                          className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="1">1 seat</option>
                          <option value="2">2 seats</option>
                          <option value="3">3 seats</option>
                          <option value="4">4 seats</option>
                          <option value="5">5 seats</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Cost per Seat (₱) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          placeholder="e.g., 150"
                          value={ride.costPerSeat}
                          onChange={(e) => setRide({ ...ride, costPerSeat: parseInt(e.target.value) })}
                          className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Trip Details
                      </label>
                      <textarea
                        placeholder="Share details about your trip, vehicle type, stops, etc..."
                        value={ride.description}
                        onChange={(e) => setRide({ ...ride, description: e.target.value })}
                        className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      To list your vehicle for rent, please navigate to the <strong>My Vehicles</strong> section in your profile.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You'll be able to add vehicle details, photos, pricing, and availability calendar there.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {step === 'form' && (
            <div className="flex gap-3 p-6 border-t border-border sticky bottom-0 bg-card">
              <button
                onClick={() => setStep('choice')}
                className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-smooth"
              >
                Back
              </button>
              {rideType === 'carpool' && (
                <button
                  onClick={handleSubmit}
                  disabled={!ride.from || !ride.to || !ride.date || !ride.time || ride.costPerSeat <= 0}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
                >
                  Create Ride
                </button>
              )}
              {rideType === 'rental' && (
                <button
                  onClick={() => {
                    handleClose();
                    setLocation('/cars');
                  }}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-smooth"
                >
                  Go to My Vehicles
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
