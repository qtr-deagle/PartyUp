import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Settings, Toggle2, Save, AlertCircle } from 'lucide-react';

/**
 * Admin Settings - System Configuration
 * 
 * Admin can configure:
 * - Feature toggles
 * - Emergency controls
 * - Platform policies
 * - Trip settings
 */
export default function AdminSettings() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    newUserSignups: true,
    tripBooking: true,
    maxDisputes: 10,
    sosAlertEnabled: true,
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
            <p className="text-sm text-muted-foreground mt-2">Configure platform features and policies</p>
          </div>

          {/* Feature Toggles */}
          <div className="bg-card rounded-2xl shadow-elevation-2 border border-border p-6">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Feature Toggles
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">Take platform offline for maintenance</p>
                </div>
                <button
                  onClick={() => handleToggle('maintenanceMode')}
                  className={`relative inline-flex h-8 w-14 rounded-full transition-colors ${
                    settings.maintenanceMode ? 'bg-destructive' : 'bg-secondary'
                  }`}
                >
                  <div
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform mt-1 ${
                      settings.maintenanceMode ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium text-foreground">New User Signups</p>
                  <p className="text-sm text-muted-foreground">Allow new users to register</p>
                </div>
                <button
                  onClick={() => handleToggle('newUserSignups')}
                  className={`relative inline-flex h-8 w-14 rounded-full transition-colors ${
                    settings.newUserSignups ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  <div
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform mt-1 ${
                      settings.newUserSignups ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Trip Booking</p>
                  <p className="text-sm text-muted-foreground">Allow users to book trips</p>
                </div>
                <button
                  onClick={() => handleToggle('tripBooking')}
                  className={`relative inline-flex h-8 w-14 rounded-full transition-colors ${
                    settings.tripBooking ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  <div
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform mt-1 ${
                      settings.tripBooking ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium text-foreground">SOS Alert System</p>
                  <p className="text-sm text-muted-foreground">Emergency alert notifications</p>
                </div>
                <button
                  onClick={() => handleToggle('sosAlertEnabled')}
                  className={`relative inline-flex h-8 w-14 rounded-full transition-colors ${
                    settings.sosAlertEnabled ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  <div
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform mt-1 ${
                      settings.sosAlertEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Configuration Values */}
          <div className="bg-card rounded-2xl shadow-elevation-2 border border-border p-6">
            <h3 className="text-lg font-bold text-foreground mb-6">Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Max Disputes Per User (Monthly)
                </label>
                <input
                  type="number"
                  value={settings.maxDisputes}
                  onChange={(e) => handleChange('maxDisputes', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth">
              <Save className="w-5 h-5" />
              Save Settings
            </button>
          </div>

          {/* Warning */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-900">Careful with these settings</p>
              <p className="text-sm text-orange-800 mt-1">
                Changing these configurations affects all users. Changes take effect immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
