import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vehicle: {
    model: string;
    year: number;
    seats: number;
    description: string;
  }) => void;
}

export default function AddVehicleModal({ isOpen, onClose, onSubmit }: AddVehicleModalProps) {
  const [vehicle, setVehicle] = useState({
    model: '',
    year: new Date().getFullYear(),
    seats: 5,
    description: '',
  });

  const handleSubmit = () => {
    if (!vehicle.model) {
      alert('Please enter vehicle model');
      return;
    }
    
    onSubmit(vehicle);
    resetForm();
  };

  const resetForm = () => {
    setVehicle({
      model: '',
      year: new Date().getFullYear(),
      seats: 5,
      description: '',
    });
  };

  const handleClose = () => {
    resetForm();
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
        <div className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full max-h-[92vh] p-4 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div>
              <h2 className="text-lg font-bold text-foreground">Add My Vehicle</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Track your personal vehicle for carpooling</p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-secondary rounded-lg transition-smooth flex-shrink-0"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-border mb-3"></div>

          {/* Content */}
          <div className="space-y-3 flex-1 overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                Vehicle Model *
              </label>
              <input
                type="text"
                placeholder="e.g., Toyota Camry 2023"
                value={vehicle.model}
                onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                  Year
                </label>
                <input
                  type="number"
                  min="2000"
                  max={new Date().getFullYear()}
                  value={vehicle.year}
                  onChange={(e) => setVehicle({ ...vehicle, year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                  Seats
                </label>
                <select
                  value={vehicle.seats}
                  onChange={(e) => setVehicle({ ...vehicle, seats: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                Description
              </label>
              <textarea
                placeholder="Describe your vehicle (color, features, condition)..."
                value={vehicle.description}
                onChange={(e) => setVehicle({ ...vehicle, description: e.target.value })}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none h-16"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border mt-3 pt-3 flex gap-2 flex-shrink-0">
            <button
              onClick={handleClose}
              className="flex-1 py-2 px-4 bg-secondary text-foreground rounded-lg text-sm font-medium transition-smooth hover:bg-secondary/80"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover:bg-primary/90"
            >
              Add Vehicle
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
