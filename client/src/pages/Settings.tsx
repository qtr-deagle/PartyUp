import React from 'react';
import Layout from '@/components/Layout';
import { ArrowLeft, Moon, Sun, Shield, MapPin, AlertTriangle, AlertCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafetyUI } from '@/contexts/SafetyContext';
import { useLocation } from 'wouter';

export default function Settings() {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const {
    edgeTabEnabled,
    setEdgeTabEnabled,
    liveLocationEnabled,
    setLiveLocationEnabled,
    warningAlertEnabled,
    setWarningAlertEnabled,
    sosEnabled,
    setSosEnabled,
  } = useSafetyUI();

  return (
    <Layout>
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 bg-card border-b border-border z-30 p-4 flex items-center justify-between">
        <button
          onClick={() => setLocation('/profile')}
          className="p-2 rounded-lg hover:bg-secondary transition-smooth"
          aria-label="Back to profile"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-primary">Settings</h1>
        <div className="w-9"></div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block sticky top-0 bg-card border-b border-border z-30">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Settings</h1>
            <p className="text-sm text-muted-foreground mt-2">Manage your preferences and safety settings</p>
          </div>
          <button
            onClick={() => setLocation('/profile')}
            className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-smooth"
          >
            Back to Profile
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Appearance Section */}
          <div className="card-luxury p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Safety Settings Section */}
          <div className="card-luxury p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              Safety Features
            </h2>
            <div className="space-y-4">
              {/* Edge Tab */}
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Safety Edge Tab
                  </h3>
                  <p className="text-sm text-muted-foreground">Show safety controls on screen edge</p>
                </div>
                <button
                  onClick={() => setEdgeTabEnabled(!edgeTabEnabled)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    edgeTabEnabled ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${
                      edgeTabEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Live Location */}
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Live Location Sharing
                  </h3>
                  <p className="text-sm text-muted-foreground">Allow real-time location sharing during trips</p>
                </div>
                <button
                  onClick={() => setLiveLocationEnabled(!liveLocationEnabled)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    liveLocationEnabled ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${
                      liveLocationEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Warning Alerts */}
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Warning Alerts
                  </h3>
                  <p className="text-sm text-muted-foreground">Receive safety warnings and alerts</p>
                </div>
                <button
                  onClick={() => setWarningAlertEnabled(!warningAlertEnabled)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    warningAlertEnabled ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${
                      warningAlertEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* SOS Button */}
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    Emergency SOS
                  </h3>
                  <p className="text-sm text-muted-foreground">Enable emergency SOS button</p>
                </div>
                <button
                  onClick={() => setSosEnabled(!sosEnabled)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    sosEnabled ? 'bg-destructive' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${
                      sosEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-accent">Safety Note:</span> These settings help protect you during your travels. 
                We recommend keeping all safety features enabled for maximum protection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
