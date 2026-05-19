import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface TourBookingPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tour: {
    title: string;
    destination: string;
    dates: string;
    organizer: string;
    pricePerPerson: number;
    numberOfDays: number;
    spotsRemaining: number;
    groupSize: number;
    paymentDeadline: string;
  };
}

export default function TourBookingPaymentModal({
  isOpen,
  onClose,
  onConfirm,
  tour,
}: TourBookingPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya'>('gcash');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const totalAmount = tour.pricePerPerson * tour.numberOfDays;
  const daysUntilDeadline = 7; // Example
  const getDeadlineColor = () => {
    if (daysUntilDeadline >= 7) return { bg: 'bg-green-500/10', text: 'text-green-600', label: `📅 ${daysUntilDeadline} days left` };
    if (daysUntilDeadline > 0) return { bg: 'bg-orange-500/10', text: 'text-orange-600', label: `⏰ ${daysUntilDeadline} days left` };
    return { bg: 'bg-red-500/10', text: 'text-red-600', label: '❌ Payment Due Soon' };
  };

  const deadline = getDeadlineColor();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
      {/* Modal */}
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg font-bold text-foreground">Tour Booking</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-lg transition-smooth"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Tour Summary */}
          <div className="space-y-2 p-4 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Tour Summary</p>
            <h3 className="font-bold text-foreground">{tour.title}</h3>
            <p className="text-sm text-muted-foreground">{tour.destination}</p>
            <p className="text-sm text-muted-foreground">{tour.dates}</p>
            <p className="text-xs text-muted-foreground mt-2">Organizer: <span className="font-semibold text-foreground">{tour.organizer}</span></p>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium mb-3">Pricing</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Price/Person</p>
                <p className="font-bold text-primary">₱{tour.pricePerPerson.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Days</p>
                <p className="font-bold text-primary">{tour.numberOfDays}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-bold text-green-600">₱{totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Payment Deadline */}
          <div className={`p-3 rounded-lg border ${deadline.bg} ${deadline.text}`}>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Payment Deadline</p>
                <p className="text-xs mt-1">{deadline.label}</p>
                <p className="text-xs mt-1">Pay by: <strong>{tour.paymentDeadline}</strong></p>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-xs text-muted-foreground mb-1">Spots Remaining</p>
            <p className="font-bold text-blue-600">{tour.spotsRemaining} of {tour.groupSize} available</p>
          </div>

          {/* Personal Info */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-medium">Your Information</p>
            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-medium">Payment Method</p>
            <div className="space-y-2">
              {[
                { id: 'gcash', label: '📱 GCash' },
                { id: 'maya', label: '💳 Maya' },
              ].map((method) => (
                <label key={method.id} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary transition-smooth">
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value as 'gcash' | 'maya')}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="flex-1 text-sm font-medium text-foreground">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Commitment Warning */}
          <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <p className="text-xs text-orange-600">
              <strong>After payment:</strong> Spot reserved for 24 hours—cancellation fees apply per tour terms.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-smooth"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:shadow-md transition-smooth flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm & Pay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
