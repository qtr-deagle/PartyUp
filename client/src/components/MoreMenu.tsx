import React, { useState, useEffect } from 'react';
import { X, User, Settings, Smartphone, Lock, Shield, Clock, LogOut, ChevronRight, Bell, AlertTriangle, Eye, EyeOff, Check, Navigation, AlertCircle } from 'lucide-react';
import { useSafetyUI } from '@/contexts/SafetyContext';

interface MenuItem {
  id: number;
  icon: React.ReactNode;
  label: string;
  description: string;
  action: () => void;
  color: 'cyan' | 'yellow' | 'green' | 'red';
}

interface SafetyLog {
  id: number;
  action: string;
  timestamp: string;
  status: 'success' | 'alert' | 'warning';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * PartyUp More Menu Drawer
 * 
 * Design: Comprehensive Settings & Profile Access
 * - Profile quick view
 * - Settings navigation
 * - Emergency contacts
 * - Privacy controls
 * - Safety activity logs
 * - Account verification status
 * - Logout
 */
export default function MoreMenu({ isOpen, onClose }: Props) {
  const [activeSection, setActiveSection] = useState<'main' | 'profile' | 'settings' | 'emergency' | 'privacy' | 'safety' | 'verification'>('main');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [dataVisible, setDataVisible] = useState(false);
  
  const {
    edgeTabEnabled,
    setEdgeTabEnabled,
    liveLocationEnabled,
    setLiveLocationEnabled,
    warningAlertEnabled,
    setWarningAlertEnabled,
    sosEnabled,
    setSosEnabled
  } = useSafetyUI();

  // Reset to main menu when drawer opens
  useEffect(() => {
    if (isOpen) {
      setActiveSection('main');
    }
  }, [isOpen]);

  const safetyLogs: SafetyLog[] = [
    { id: 1, action: 'Live location shared with Sarah', timestamp: '2 mins ago', status: 'success' },
    { id: 2, action: 'Geofence alert - left safe zone', timestamp: '45 mins ago', status: 'alert' },
    { id: 3, action: 'Profile verified by ID', timestamp: '2 days ago', status: 'success' },
    { id: 4, action: 'Warning issued to unsafe user', timestamp: '1 week ago', status: 'warning' },
  ];

  const emergencyContacts = [
    { id: 1, name: 'Mom', phone: '+63 917 XXX XXXX', verified: true },
    { id: 2, name: 'Best Friend', phone: '+63 903 XXX XXXX', verified: true },
    { id: 3, name: 'Office', phone: '+63 917 XXX XXXX', verified: false },
  ];

  const verificationStatus = [
    { item: 'Email', verified: true, date: '2024-01-15' },
    { item: 'Phone', verified: true, date: '2024-01-15' },
    { item: 'ID Verification', verified: true, date: '2024-01-16' },
    { item: 'Background Check', verified: false, date: null },
  ];

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logging out...');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800 slide-in-right shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-black/50 backdrop-blur-sm border-b border-slate-600/30 p-4 flex items-center justify-between z-40">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            {activeSection === 'main' && 'More'}
            {activeSection === 'profile' && 'Profile'}
            {activeSection === 'settings' && 'Settings'}
            {activeSection === 'emergency' && 'Emergency Contacts'}
            {activeSection === 'privacy' && 'Privacy'}
            {activeSection === 'safety' && 'Safety Logs'}
            {activeSection === 'verification' && 'Verification'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-600/10 rounded-full transition-all"
          >
            <X className="w-5 h-5 text-blue-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Menu */}
          {activeSection === 'main' && (
            <div className="p-4 space-y-2">
              {/* Profile Card */}
              <button
                onClick={() => setActiveSection('profile')}
                className="w-full p-4 bg-blue-600/15 border border-blue-600/30 rounded-xl hover:border-blue-600/50 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-slate-600 flex items-center justify-center font-bold text-black">
                    AJ
                  </div>
                  <div>
                    <p className="font-bold text-white">Alex Johnson</p>
                    <p className="text-xs text-blue-400">See profile</p>
                  </div>
                </div>
              </button>

              {/* Quick Links */}
              <ul className="space-y-1 mt-6">
                <li>
                  <button
                    onClick={() => setActiveSection('settings')}
                    className="w-full p-4 rounded-lg hover:bg-blue-600/10 transition-all flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-blue-500" />
                      <span className="text-white font-medium">Settings</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-all" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('emergency')}
                    className="w-full p-4 rounded-lg hover:bg-blue-600/10 transition-all flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <span className="text-white font-medium">Emergency Contacts</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-all" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('privacy')}
                    className="w-full p-4 rounded-lg hover:bg-blue-600/10 transition-all flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-blue-500" />
                      <span className="text-white font-medium">Privacy Controls</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-all" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('safety')}
                    className="w-full p-4 rounded-lg hover:bg-blue-600/10 transition-all flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-green-500" />
                      <span className="text-white font-medium">Safety Activity</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-all" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('verification')}
                    className="w-full p-4 rounded-lg hover:bg-blue-600/10 transition-all flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-blue-500" />
                      <span className="text-white font-medium">Verification</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-all" />
                  </button>
                </li>
              </ul>

              {/* Logout Button */}
              <div className="pt-4 mt-6 border-t border-slate-600/30">
                <button
                  onClick={handleLogout}
                  className="w-full p-4 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500/50 transition-all flex items-center gap-3 text-red-400 font-semibold mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="p-4 space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-slate-600 flex items-center justify-center font-bold text-white text-2xl">
                  AJ
                </div>
              </div>
              <div className="bg-slate-800/50 border border-teal-500/20 rounded-lg p-4 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Name</span>
                  <span className="text-white font-semibold">Alex Johnson</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Age</span>
                  <span className="text-white font-semibold">26</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Member Since</span>
                  <span className="text-white font-semibold">Jan 2024</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Rating</span>
                  <span className="text-white font-semibold">⭐ 4.8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Trips Completed</span>
                  <span className="text-white font-semibold">23</span>
                </div>
              </div>
              <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all">
                Edit Profile
              </button>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <h3 className="font-bold text-white text-sm px-2">Notifications</h3>
                <div className="bg-slate-800/50 border border-blue-600/20 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-white font-medium text-sm flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-500" />
                    Push Notifications
                  </span>
                  <button
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`w-10 h-6 rounded-full transition-all ${
                      notificationsEnabled ? 'bg-blue-600' : 'bg-slate-700'
                    } flex items-center ${notificationsEnabled ? 'justify-end' : 'justify-start'} p-1`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-white text-sm px-2">Privacy</h3>
                <div className="bg-slate-800/50 border border-blue-600/20 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-white font-medium text-sm">Location Sharing</span>
                  <button
                    onClick={() => setLocationSharing(!locationSharing)}
                    className={`w-10 h-6 rounded-full transition-all ${
                      locationSharing ? 'bg-blue-600' : 'bg-slate-700'
                    } flex items-center ${locationSharing ? 'justify-end' : 'justify-start'} p-1`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-white text-sm px-2">Safety Features - Edge Tab</h3>
                <div className="bg-slate-800/50 border border-blue-600/20 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-white font-medium text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    Enable Edge Tab
                  </span>
                  <button
                    onClick={() => setEdgeTabEnabled(!edgeTabEnabled)}
                    className={`w-10 h-6 rounded-full transition-all ${
                      edgeTabEnabled ? 'bg-blue-600' : 'bg-slate-700'
                    } flex items-center ${edgeTabEnabled ? 'justify-end' : 'justify-start'} p-1`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
                {edgeTabEnabled && (
                  <>
                    <div className="bg-slate-800/50 border border-blue-600/20 rounded-lg p-4 flex items-center justify-between">
                      <span className="text-white font-medium text-sm flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-blue-500" />
                        Live Location
                      </span>
                      <button
                        onClick={() => setLiveLocationEnabled(!liveLocationEnabled)}
                        className={`w-10 h-6 rounded-full transition-all ${
                          liveLocationEnabled ? 'bg-blue-600' : 'bg-slate-700'
                        } flex items-center ${liveLocationEnabled ? 'justify-end' : 'justify-start'} p-1`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>
                    <div className="bg-slate-800/50 border border-amber-600/20 rounded-lg p-4 flex items-center justify-between">
                      <span className="text-white font-medium text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Warning Alert
                      </span>
                      <button
                        onClick={() => setWarningAlertEnabled(!warningAlertEnabled)}
                        className={`w-10 h-6 rounded-full transition-all ${
                          warningAlertEnabled ? 'bg-amber-600' : 'bg-slate-700'
                        } flex items-center ${warningAlertEnabled ? 'justify-end' : 'justify-start'} p-1`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>
                    <div className="bg-slate-800/50 border border-red-600/20 rounded-lg p-4 flex items-center justify-between">
                      <span className="text-white font-medium text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        SOS Button
                      </span>
                      <button
                        onClick={() => setSosEnabled(!sosEnabled)}
                        className={`w-10 h-6 rounded-full transition-all ${
                          sosEnabled ? 'bg-red-600' : 'bg-slate-700'
                        } flex items-center ${sosEnabled ? 'justify-end' : 'justify-start'} p-1`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-white text-sm px-2">Account</h3>
                <button className="w-full p-3 bg-slate-800/50 border border-blue-600/20 rounded-lg hover:border-blue-600/40 transition-all text-left text-white font-medium text-sm">
                  Change Password
                </button>
                <button className="w-full p-3 bg-slate-800/50 border border-blue-600/20 rounded-lg hover:border-blue-600/40 transition-all text-left text-white font-medium text-sm">
                  Two-Factor Authentication
                </button>
              </div>
            </div>
          )}

          {/* Emergency Contacts Section */}
          {activeSection === 'emergency' && (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                {emergencyContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-4 bg-slate-800/50 border border-amber-600/20 rounded-lg hover:border-amber-600/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">{contact.name}</h4>
                      {contact.verified && (
                        <span className="text-green-400 text-xs font-bold">✓ Verified</span>
                      )}
                    </div>
                    <p className="text-blue-400 text-sm font-mono flex items-center gap-2">
                      {dataVisible ? contact.phone : contact.phone.replace(/\d(?=\d{4})/g, '*')}
                    </p>
                  </div>
                ))}
              </div>
              <button className="w-full py-2.5 bg-blue-600/20 border border-blue-600/30 text-blue-400 rounded-lg font-semibold hover:bg-blue-600/30 transition-all text-sm">
                + Add Emergency Contact
              </button>
            </div>
          )}

          {/* Privacy Controls Section */}
          {activeSection === 'privacy' && (
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="bg-slate-800/50 border border-blue-600/20 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-white font-medium text-sm flex items-center gap-2">
                    {dataVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    Show Sensitive Data
                  </span>
                  <button
                    onClick={() => setDataVisible(!dataVisible)}
                    className={`w-10 h-6 rounded-full transition-all ${
                      dataVisible ? 'bg-blue-600' : 'bg-slate-700'
                    } flex items-center ${dataVisible ? 'justify-end' : 'justify-start'} p-1`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white text-sm px-2">Who Can See Your Profile</h3>
                <button className="w-full text-left p-3 bg-slate-800/50 border border-blue-600/20 rounded-lg hover:border-blue-600/40 transition-all text-white font-medium text-sm">
                  Everyone
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white text-sm px-2">Data & Privacy</h3>
                <button className="w-full text-left p-3 bg-slate-800/50 border border-blue-600/20 rounded-lg hover:border-blue-600/40 transition-all text-white font-medium text-sm">
                  Download My Data
                </button>
                <button className="w-full text-left p-3 bg-red-500/15 border border-red-500/20 rounded-lg hover:border-red-500/40 transition-all text-red-400 font-medium text-sm">
                  Delete My Account
                </button>
              </div>
            </div>
          )}

          {/* Safety Activity Section */}
          {activeSection === 'safety' && (
            <div className="p-4 space-y-2">
              {safetyLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border ${
                    log.status === 'success'
                      ? 'bg-green-500/10 border-green-500/20'
                      : log.status === 'alert'
                      ? 'bg-yellow-500/10 border-yellow-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  <p className="text-sm text-white font-medium">{log.action}</p>
                  <p className="text-xs text-slate-400 mt-1">{log.timestamp}</p>
                </div>
              ))}
            </div>
          )}

          {/* Verification Section */}
          {activeSection === 'verification' && (
            <div className="p-4 space-y-2">
              {verificationStatus.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    item.verified
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-yellow-500/10 border-yellow-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold text-sm">{item.item}</span>
                    {item.verified ? (
                      <span className="text-green-400 font-bold text-xs">✓ Verified</span>
                    ) : (
                      <button className="text-yellow-400 font-bold text-xs hover:underline">
                        Verify Now
                      </button>
                    )}
                  </div>
                  {item.verified && item.date && (
                    <p className="text-xs text-green-400 mt-1">{item.date}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
