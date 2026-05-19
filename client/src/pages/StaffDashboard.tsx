import React from 'react';
import StaffLayout from '@/components/StaffLayout';
import { AlertCircle, CheckSquare, Car, Plane, Activity, Bell, Phone, MapPin } from 'lucide-react';

/**
 * Staff Dashboard
 * 
 * Staff can:
 * - Monitor pending reports and disputes
 * - Review vehicle listings
 * - Monitor active trips
 * - Access quick actions for common tasks
 */
export default function StaffDashboard() {
  const stats = [
    { label: 'Pending Reports', value: '23', icon: AlertCircle, color: 'bg-destructive/10', textColor: 'text-destructive' },
    { label: 'Open Disputes', value: '8', icon: CheckSquare, color: 'bg-orange-500/10', textColor: 'text-orange-500' },
    { label: 'Vehicles to Verify', value: '12', icon: Car, color: 'bg-primary/10', textColor: 'text-primary' },
    { label: 'Active Trips', value: '456', icon: Plane, color: 'bg-accent/10', textColor: 'text-accent' },
  ];

  const sosAlerts = [
    { id: 1, trip: 'Trip #489 - Boston to NYC', user: 'Sarah Johnson', location: 'Highway 95, MA', time: '2 mins ago', severity: 'P1' },
    { id: 2, trip: 'Trip #487 - Miami to Key West', user: 'Mark Davis', location: 'Route 1, FL', time: '15 mins ago', severity: 'P1' },
  ];

  const moderationQueue = [
    { id: 1, report: 'Harassment report - John said racist slur', user: 'Jane Smith', severity: 'P2', time: '10 mins ago' },
    { id: 2, report: 'Safety concern - User without ID verification', user: 'Bob Wilson', severity: 'P2', time: '25 mins ago' },
    { id: 3, report: 'Policy violation - Sharing payment info in chat', user: 'Lisa Chen', severity: 'P3', time: '45 mins ago' },
  ];

  const dailyStats = [
    { label: 'Trips Monitored', value: '234', icon: '👁️' },
    { label: 'SOS Calls Handled', value: '8', icon: '📞' },
    { label: 'Violations Flagged', value: '42', icon: '🚩' },
    { label: 'Users Banned', value: '3', icon: '🔒' },
  ];

  return (
    <StaffLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-2">Real-time safety monitoring and moderation</p>
        </div>

        {/* SOS ALERTS - Prominent Red Section */}
        {sosAlerts.length > 0 && (
          <div className="bg-destructive/10 border-2 border-destructive rounded-2xl p-6 shadow-elevation-2">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-6 h-6 text-destructive animate-pulse" />
              <h2 className="text-lg font-bold text-destructive">URGENT SOS ALERTS</h2>
            </div>
            <div className="space-y-3">
              {sosAlerts.map((alert) => (
                <div key={alert.id} className="bg-destructive/5 border border-destructive/30 rounded-lg p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-destructive">{alert.trip}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{alert.user}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {alert.location}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-destructive bg-destructive/20 px-2 py-1 rounded">{alert.severity}</p>
                    <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:shadow-lg transition-smooth">
              <Phone className="w-4 h-4 inline mr-2" /> Respond to SOS
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className={`${stat.textColor} w-6 h-6`} />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Prioritized Moderation Queue */}
        <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Moderation Queue (Prioritized)</h3>
          </div>
          <div className="space-y-3">
            {moderationQueue.map((item) => {
              const severityColor = 
                item.severity === 'P1' ? 'bg-destructive/20 text-destructive' :
                item.severity === 'P2' ? 'bg-orange-500/20 text-orange-600' : 
                'bg-yellow-500/20 text-yellow-700';
              return (
                <div key={item.id} className="flex items-start justify-between p-4 bg-secondary rounded-lg border border-border">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.report}</p>
                    <p className="text-xs text-muted-foreground mt-1">Reported by: {item.user}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold px-2 py-1 rounded ${severityColor}`}>{item.severity}</p>
                    <p className="text-xs text-muted-foreground mt-2">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Statistics */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {dailyStats.map((stat, idx) => (
              <div key={idx} className="bg-card rounded-xl p-4 shadow-elevation-2 border border-border">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1 bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full py-3 px-4 bg-destructive text-destructive-foreground rounded-lg font-medium hover:shadow-lg transition-smooth">
                Review Reports
              </button>
              <button className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth">
                Handle Disputes
              </button>
              <button className="w-full py-3 px-4 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-smooth border border-border">
                Verify Vehicles
              </button>
              <button className="w-full py-3 px-4 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-smooth border border-border">
                Monitor Trips
              </button>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
