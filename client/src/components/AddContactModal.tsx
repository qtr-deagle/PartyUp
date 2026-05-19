import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, Phone, Mail } from 'lucide-react';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: {
    name: string;
    phone: string;
    email: string;
    relationship: string;
    emergencyInfo?: string;
  }) => void;
}

export default function AddContactModal({ isOpen, onClose, onSubmit }: AddContactModalProps) {
  const [step, setStep] = useState<'details' | 'emergency'>('details');
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    emergencyInfo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('details');
      setNewContact({ name: '', phone: '', email: '', relationship: '', emergencyInfo: '' });
      setErrors({});
    }
  }, [isOpen]);

  const relationshipOptions = [
    { value: 'Parent', label: 'Parent' },
    { value: 'Sibling', label: 'Sibling' },
    { value: 'Spouse', label: 'Spouse/Partner' },
    { value: 'Friend', label: 'Friend' },
    { value: 'Colleague', label: 'Colleague' },
    { value: 'Guardian', label: 'Guardian' },
    { value: 'Other', label: 'Other' },
  ];

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (!newContact.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!newContact.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(newContact.phone)) {
      newErrors.phone = 'Enter a valid phone number';
    }

    if (newContact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newContact.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!newContact.relationship) {
      newErrors.relationship = 'Please select a relationship';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setStep('emergency');
    }
  };

  const handleSubmit = () => {
    if (validateStep()) {
      onSubmit(newContact);
      setNewContact({ name: '', phone: '', email: '', relationship: '', emergencyInfo: '' });
      setStep('details');
      onClose();
    }
  };

  const handleClose = () => {
    setNewContact({ name: '', phone: '', email: '', relationship: '', emergencyInfo: '' });
    setStep('details');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
            <div>
              <h2 className="text-xl font-bold text-foreground">Add Emergency Contact</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {step === 'details' && 'Step 1 of 2: Contact Details'}
                {step === 'emergency' && 'Step 2 of 2: Emergency Information'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-secondary rounded-lg transition-smooth"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: step === 'details' ? '50%' : '100%' }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'details' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Mom, Sarah"
                    value={newContact.name}
                    onChange={(e) => {
                      setNewContact({ ...newContact, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    className={`w-full px-4 py-2.5 bg-secondary border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-smooth ${
                      errors.name ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number * <span className="text-xs text-muted-foreground">(Primary contact)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={newContact.phone}
                      onChange={(e) => {
                        setNewContact({ ...newContact, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      className={`flex-1 px-4 py-2.5 bg-secondary border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-smooth ${
                        errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address <span className="text-xs text-muted-foreground">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="contact@example.com"
                      value={newContact.email}
                      onChange={(e) => {
                        setNewContact({ ...newContact, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      className={`flex-1 px-4 py-2.5 bg-secondary border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-smooth ${
                        errors.email ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Relationship *
                  </label>
                  <select
                    value={newContact.relationship}
                    onChange={(e) => {
                      setNewContact({ ...newContact, relationship: e.target.value });
                      if (errors.relationship) setErrors({ ...errors, relationship: '' });
                    }}
                    className={`w-full px-4 py-2.5 bg-secondary border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 transition-smooth ${
                      errors.relationship ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
                    }`}
                  >
                    <option value="">Select relationship</option>
                    {relationshipOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.relationship && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.relationship}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    ℹ️ This contact will receive SOS alerts and emergency notifications during your trips.
                  </p>
                </div>
              </div>
            )}

            {step === 'emergency' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Emergency Information <span className="text-xs text-muted-foreground">(Optional)</span>
                  </label>
                  <textarea
                    placeholder="e.g., Medical conditions, medication allergies, special instructions..."
                    value={newContact.emergencyInfo}
                    onChange={(e) => setNewContact({ ...newContact, emergencyInfo: e.target.value })}
                    maxLength={200}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {newContact.emergencyInfo.length}/200 characters
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    ⚠️ Emergency information will only be shared in urgent situations with authorized personnel.
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <div className="flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-green-800 dark:text-green-200">
                      <p className="font-medium">Contact Summary:</p>
                      <p className="mt-1">
                        <span className="font-medium">{newContact.name}</span> ({newContact.relationship})<br />
                        📱 {newContact.phone}<br />
                        {newContact.email && `✉️ ${newContact.email}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex gap-3 p-6 border-t border-border bg-card">
            <button
              onClick={step === 'details' ? handleClose : () => setStep('details')}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-smooth"
            >
              {step === 'details' ? 'Cancel' : 'Back'}
            </button>
            <button
              onClick={step === 'details' ? handleNextStep : handleSubmit}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-smooth"
            >
              {step === 'details' ? 'Next' : 'Add Contact'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
