import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ride: {
    from: string;
    to: string;
    date: string;
    time: string;
    seats: number;
    description: string;
    pricePerPerson: number;
  }) => void;
}

export default function CreateRideModal({ isOpen, onClose, onSubmit }: CreateRideModalProps) {
  const [step, setStep] = useState<'form'>('form');
  const [ride, setRide] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    seats: 3,
    description: '',
    pricePerPerson: 0,
  });

  const handleSubmit = () => {
    if (ride.from && ride.to && ride.date && ride.time) {
      onSubmit(ride);
      setRide({
        from: '',
        to: '',
        date: '',
        time: '',
        seats: 3,
        description: '',
        pricePerPerson: 0,
      });
    }
  };

  const handleClose = () => {
    setRide({
      from: '',
      to: '',
      date: '',
      time: '',
      seats: 3,
      description: '',
      pricePerPerson: 0,
    });
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
              <h2 className="text-xl font-bold text-foreground">Share Your Ride</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Help fellow travelers reach their destination together
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-secondary rounded-lg transition-smooth"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-4">
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
                        Price Per Person *
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 250"
                        value={ride.pricePerPerson || ''}
                        onChange={(e) => setRide({ ...ride, pricePerPerson: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
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
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-border sticky bottom-0 bg-card">
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-smooth"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!ride.from || !ride.to || !ride.date || !ride.time || ride.pricePerPerson <= 0}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
            >
              Create Ride
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
