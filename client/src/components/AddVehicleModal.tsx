import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vehicle: {
    model: string;
    year: number;
    seats: number;
    pricePerDay: number;
    description: string;
  }) => void;
}

export default function AddVehicleModal({ isOpen, onClose, onSubmit }: AddVehicleModalProps) {
  const [vehicle, setVehicle] = useState({
    model: '',
    year: new Date().getFullYear(),
    seats: 5,
    pricePerDay: 0,
    description: '',
  });

  const handleSubmit = () => {
    if (vehicle.model && vehicle.pricePerDay > 0) {
      onSubmit(vehicle);
      setVehicle({
        model: '',
        year: new Date().getFullYear(),
        seats: 5,
        pricePerDay: 0,
        description: '',
      });
    }
  };

  const handleClose = () => {
    setVehicle({
      model: '',
      year: new Date().getFullYear(),
      seats: 5,
      pricePerDay: 0,
      description: '',
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
              <h2 className="text-xl font-bold text-foreground">List Your Vehicle</h2>
              <p className="text-xs text-muted-foreground mt-1">Earn money by renting to verified travelers</p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-secondary rounded-lg transition-smooth"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Vehicle Model *
              </label>
              <input
                type="text"
                placeholder="e.g., Toyota Camry 2023"
                value={vehicle.model}
                onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Year
                </label>
                <input
                  type="number"
                  min="2000"
                  max={new Date().getFullYear()}
                  value={vehicle.year}
                  onChange={(e) => setVehicle({ ...vehicle, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Seats
                </label>
                <select
                  value={vehicle.seats}
                  onChange={(e) => setVehicle({ ...vehicle, seats: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="2">2 seats</option>
                  <option value="4">4 seats</option>
                  <option value="5">5 seats</option>
                  <option value="7">7 seats</option>
                  <option value="8">8+ seats</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Price per Day (₱) *
              </label>
              <input
                type="number"
                min="0"
                step="100"
                placeholder="e.g., 2500"
                value={vehicle.pricePerDay}
                onChange={(e) => setVehicle({ ...vehicle, pricePerDay: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                placeholder="Describe your vehicle condition, features, and rental terms..."
                value={vehicle.description}
                onChange={(e) => setVehicle({ ...vehicle, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Photos
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-secondary/50 transition-smooth cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload photos</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
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
              disabled={!vehicle.model || vehicle.pricePerDay <= 0}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
            >
              List Vehicle
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
