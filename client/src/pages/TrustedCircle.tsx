import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Users, Plus, Trash2, Shield, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface TrustedContact {
  id: number;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  verified: boolean;
  notificationEnabled: boolean;
}

/**
 * PartyUp Trusted Circle Page
 * 
 * Design: Minimalist Luxury
 * - Manage trusted circle contacts
 * - Add/remove emergency contacts
 * - Control notification settings
 * - Verification status
 */
export default function TrustedCircle() {
  const [contacts, setContacts] = useState<TrustedContact[]>([
    {
      id: 1,
      name: 'Mom',
      phone: '+1 (555) 123-4567',
      email: 'mom@example.com',
      relationship: 'Parent',
      verified: true,
      notificationEnabled: true,
    },
    {
      id: 2,
      name: 'Best Friend Sarah',
      phone: '+1 (555) 987-6543',
      email: 'sarah@example.com',
      relationship: 'Friend',
      verified: true,
      notificationEnabled: true,
    },
    {
      id: 3,
      name: 'Dad',
      phone: '+1 (555) 456-7890',
      email: 'dad@example.com',
      relationship: 'Parent',
      verified: true,
      notificationEnabled: false,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
  });

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      setContacts([
        ...contacts,
        {
          id: contacts.length + 1,
          ...newContact,
          verified: false,
          notificationEnabled: true,
        },
      ]);
      setNewContact({ name: '', phone: '', email: '', relationship: '' });
      setShowAddForm(false);
      toast.success('Contact added! Verification email sent.');
    }
  };

  const handleRemoveContact = (id: number) => {
    setContacts(contacts.filter((c) => c.id !== id));
    toast.success('Contact removed');
  };

  const handleToggleNotification = (id: number) => {
    setContacts(
      contacts.map((c) =>
        c.id === id ? { ...c, notificationEnabled: !c.notificationEnabled } : c
      )
    );
  };

  return (
    <Layout>
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 bg-card border-b border-border z-30 p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Trusted Circle</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 rounded-lg hover:bg-secondary transition-smooth bg-primary text-primary-foreground"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block sticky top-0 bg-card border-b border-border z-30">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Trusted Circle</h1>
            <p className="text-sm text-muted-foreground mt-2">Manage your emergency contacts and safety network</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-md transition-smooth"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">Add Contact</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-8">
        {/* Add Contact Form */}
        {showAddForm && (
          <div className="mb-6 card-luxury p-6">
            <h3 className="font-bold text-lg mb-4">Add Emergency Contact</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full px-4 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="w-full px-4 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                className="w-full px-4 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                className="w-full px-4 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Relationship</option>
                <option value="Parent">Parent</option>
                <option value="Friend">Friend</option>
                <option value="Sibling">Sibling</option>
                <option value="Partner">Partner</option>
                <option value="Other">Other</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 border border-border rounded-lg text-sm font-medium transition-smooth hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContact}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover:shadow-md"
                >
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="card-luxury p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">{contact.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{contact.relationship}</p>
                </div>
                {contact.verified && (
                  <Shield className="w-5 h-5 text-accent shrink-0" />
                )}
              </div>

              {/* Contact Details */}
              <div className="space-y-2 mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>{contact.phone}</span>
                </div>
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <span>{contact.email}</span>
                  </div>
                )}
              </div>

              {/* Notification Toggle */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Send SOS alerts</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contact.notificationEnabled}
                    onChange={() => handleToggleNotification(contact.id)}
                    className="w-4 h-4 rounded"
                  />
                </label>
              </div>

              {/* Actions */}
              <button
                onClick={() => handleRemoveContact(contact.id)}
                className="w-full py-2 border border-destructive text-destructive rounded-lg text-sm font-medium transition-smooth hover:bg-destructive/5"
              >
                <Trash2 className="w-4 h-4 mx-auto" />
              </button>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-1 gap-6">
          {contacts.map((contact) => (
            <div key={contact.id} className="card-luxury p-8">
              <div className="grid grid-cols-4 gap-8 items-center">
                {/* Contact Info */}
                <div className="col-span-2">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold">{contact.name}</h3>
                        {contact.verified && (
                          <Shield className="w-5 h-5 text-accent" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{contact.relationship}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-primary shrink-0" />
                          <span>{contact.phone}</span>
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-primary shrink-0" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notification Setting */}
                <div className="col-span-1">
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-xs text-muted-foreground mb-3">SOS Alerts</p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={contact.notificationEnabled}
                        onChange={() => handleToggleNotification(contact.id)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm font-medium">
                        {contact.notificationEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <button
                    onClick={() => handleRemoveContact(contact.id)}
                    className="w-full py-2 border border-destructive text-destructive rounded-lg text-sm font-medium transition-smooth hover:bg-destructive/5"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Safety Info */}
        <div className="mt-8 card-luxury p-6 md:p-8 bg-primary/5 border border-primary/20">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            How Trusted Circle Works
          </h3>
          <p className="text-sm text-foreground leading-relaxed">
            When you activate the SOS emergency button, your location and safety status will be immediately shared with all contacts in your trusted circle who have alerts enabled. They'll receive a notification with your real-time location and can contact you or local authorities if needed.
          </p>
        </div>
      </div>
    </Layout>
  );
}
