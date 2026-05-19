import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AddContactModal from '@/components/AddContactModal';
import { Users, Plus, Shield, Phone, Mail, AlertCircle, Bell, BellOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface TrustedContact {
  id: number;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  verified: boolean;
  notificationEnabled: boolean;
  emergencyInfo?: string;
  addedDate?: string;
}

/**
 * PartyUp Trusted Circle Page
 * 
 * Design: Minimalist Luxury
 * - Manage trusted circle contacts
 * - Add/remove emergency contacts
 * - Control notification settings
 * - Verification status
 * - Emergency information display
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
      emergencyInfo: 'Medical alert: Has asthma, emergency inhaler in bag',
      addedDate: '2026-01-15',
    },
    {
      id: 2,
      name: 'Best Friend Sarah',
      phone: '+1 (555) 987-6543',
      email: 'sarah@example.com',
      relationship: 'Friend',
      verified: true,
      notificationEnabled: true,
      emergencyInfo: '',
      addedDate: '2026-02-20',
    },
    {
      id: 3,
      name: 'Dad',
      phone: '+1 (555) 456-7890',
      email: 'dad@example.com',
      relationship: 'Parent',
      verified: true,
      notificationEnabled: false,
      emergencyInfo: 'Can be reached anytime for emergencies',
      addedDate: '2026-01-10',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddContact = (newContact: {
    name: string;
    phone: string;
    email: string;
    relationship: string;
    emergencyInfo?: string;
  }) => {
    setContacts([
      ...contacts,
      {
        id: contacts.length + 1,
        ...newContact,
        verified: false,
        notificationEnabled: true,
        addedDate: new Date().toISOString().split('T')[0],
      },
    ]);
    setShowAddModal(false);
    toast.success('Contact added! Verification email sent.');
  };

  const handleRemoveContact = (id: number) => {
    const contact = contacts.find(c => c.id === id);
    setContacts(contacts.filter((c) => c.id !== id));
    toast.success(`${contact?.name} removed from Trusted Circle`);
  };

  const handleToggleNotification = (id: number) => {
    setContacts(
      contacts.map((c) => {
        if (c.id === id) {
          const newState = !c.notificationEnabled;
          toast.success(
            newState
              ? 'SOS alerts enabled for this contact'
              : 'SOS alerts disabled for this contact'
          );
          return { ...c, notificationEnabled: newState };
        }
        return c;
      })
    );
  };

  const getRelationshipColor = (relationship: string) => {
    const colors: Record<string, string> = {
      'Parent': 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
      'Sibling': 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
      'Spouse': 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
      'Friend': 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      'Colleague': 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
      'Guardian': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300',
      'Other': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    };
    return colors[relationship] || colors['Other'];
  };

  return (
    <Layout>
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border z-30">
        <div className="p-4 md:p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Trusted Circle</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-2">{contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'} • Manage emergency alerts</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 p-2 md:px-4 md:py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth font-medium shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline text-sm">Add Contact</span>
          </button>
        </div>
      </div>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddContact}
      />

      {/* Main Content */}
      <div className="p-4 md:p-8 max-w-2xl">
        {/* Stats - Mobile Only */}
        {contacts.length > 0 && (
          <div className="md:hidden grid grid-cols-3 gap-2 mb-6">
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-primary">{contacts.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Total</p>
            </div>
            <div className="bg-accent/10 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-accent">{contacts.filter(c => c.notificationEnabled).length}</p>
              <p className="text-xs text-muted-foreground mt-1">Alerts On</p>
            </div>
            <div className="bg-green-500/10 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-green-600">{contacts.filter(c => c.verified).length}</p>
              <p className="text-xs text-muted-foreground mt-1">Verified</p>
            </div>
          </div>
        )}

        {/* Contacts List */}
        <div className="space-y-3">
          {contacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No Contacts Yet</h3>
              <p className="text-sm text-muted-foreground mb-6">Add trusted people who'll get SOS alerts</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-smooth"
              >
                Add First Contact
              </button>
            </div>
          ) : (
            contacts.map((contact) => (
              <div key={contact.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-smooth">
                {/* Top Row - Name & Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-foreground truncate">{contact.name}</h3>
                      {contact.verified && (
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      )}
                    </div>
                    <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${getRelationshipColor(contact.relationship)}`}>
                      {contact.relationship}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleNotification(contact.id)}
                    className="p-2 rounded-lg hover:bg-secondary transition-smooth shrink-0"
                    title={contact.notificationEnabled ? 'Alerts enabled' : 'Alerts disabled'}
                  >
                    {contact.notificationEnabled ? (
                      <Bell className="w-5 h-5 text-primary" />
                    ) : (
                      <BellOff className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 mb-3 pb-3 border-b border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-foreground font-medium">{contact.phone}</span>
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                </div>

                {/* Emergency Info - If Present */}
                {contact.emergencyInfo && (
                  <div className="mb-3 p-2.5 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Emergency Info
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 line-clamp-2">{contact.emergencyInfo}</p>
                  </div>
                )}

                {/* Footer - Status & Date */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-muted-foreground">
                    Added {contact.addedDate ? new Date(contact.addedDate).toLocaleDateString() : 'recently'}
                  </span>
                  <span className={`px-2 py-1 rounded font-medium ${
                    contact.notificationEnabled ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {contact.notificationEnabled ? 'Alerts On' : 'Alerts Off'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleNotification(contact.id)}
                    className="flex-1 py-2 text-xs font-medium border border-border rounded-lg text-foreground hover:bg-secondary transition-smooth"
                  >
                    {contact.notificationEnabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleRemoveContact(contact.id)}
                    className="flex-1 py-2 text-xs font-medium border border-destructive text-destructive rounded-lg hover:bg-destructive/5 transition-smooth"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Additional Views - Hidden on Mobile */}
        {contacts.length > 0 && (
          <>
            <div className="hidden md:mt-12 md:block">
              <h2 className="text-2xl font-bold text-foreground mb-6">Desktop View</h2>
              <div className="grid grid-cols-1 gap-6">
                {contacts.map((contact) => (
                  <div key={contact.id} className="card-luxury p-8 border border-border">
                    <div className="grid grid-cols-12 gap-6 items-start">
                      {/* Contact Info */}
                      <div className="col-span-5">
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 font-bold text-lg text-white ${
                            contact.relationship === 'Parent' ? 'bg-blue-500' :
                            contact.relationship === 'Friend' ? 'bg-green-500' :
                            contact.relationship === 'Sibling' ? 'bg-purple-500' :
                            'bg-primary'
                          }`}>
                            {contact.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold">{contact.name}</h3>
                              {contact.verified && (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              )}
                            </div>
                            <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full mb-3 ${getRelationshipColor(contact.relationship)}`}>
                              {contact.relationship}
                            </span>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-primary shrink-0" />
                                <span className="font-medium">{contact.phone}</span>
                              </div>
                              {contact.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="w-4 h-4 text-primary shrink-0" />
                                  <span className="text-muted-foreground">{contact.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Emergency Info */}
                      <div className="col-span-3">
                        {contact.emergencyInfo ? (
                          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" /> Emergency Info
                            </p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">{contact.emergencyInfo}</p>
                          </div>
                        ) : (
                          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-sm text-muted-foreground">No emergency info</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-4 space-y-3">
                        <div className="p-4 bg-secondary rounded-lg">
                          <p className="text-xs font-semibold text-muted-foreground mb-3">ALERTS</p>
                          <div className="flex items-center gap-2 mb-3">
                            {contact.notificationEnabled ? (
                              <>
                                <Bell className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium">Enabled</span>
                              </>
                            ) : (
                              <>
                                <BellOff className="w-5 h-5 text-muted-foreground" />
                                <span className="text-sm font-medium">Disabled</span>
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => handleToggleNotification(contact.id)}
                            className="w-full py-2 text-xs font-medium px-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-smooth"
                          >
                            {contact.notificationEnabled ? 'Disable Alerts' : 'Enable Alerts'}
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveContact(contact.id)}
                          className="w-full py-2 border border-destructive text-destructive rounded-lg text-sm font-medium transition-smooth hover:bg-destructive/5"
                        >
                          Remove Contact
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Safety Info Section - Mobile Friendly */}
        {contacts.length > 0 && (
          <div className="mt-8 card-luxury p-4 md:p-8 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-xl">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary shrink-0" />
              How It Works
            </h3>
            <div className="space-y-3 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
              <div>
                <p className="text-xs md:text-sm font-medium text-foreground mb-1">🚨 Emergency Alert</p>
                <p className="text-xs text-muted-foreground">Tap SOS to instantly alert all enabled contacts</p>
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-foreground mb-1">📍 Real-Time Location</p>
                <p className="text-xs text-muted-foreground">Share your live location with trusted people</p>
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-foreground mb-1">🔒 Secure & Private</p>
                <p className="text-xs text-muted-foreground">Info only shared in emergencies with verified contacts</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
