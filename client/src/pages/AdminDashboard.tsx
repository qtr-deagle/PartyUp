import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Users, TrendingUp, AlertTriangle, Activity, CheckCircle, AlertCircle, Percent, DollarSign } from 'lucide-react';

/**
 * Admin Dashboard - Strategic Overview
 * 
 * Admin can see:
 * - Key business metrics (KPIs)
 * - Staff performance metrics
 * - System health and alerts
 * - Critical notifications
 */
export default function AdminDashboard() {
  const kpis = [
    { label: 'Active Users', value: '3,247', change: '+12%', icon: Users, color: 'bg-primary/10', textColor: 'text-primary' },
    { label: 'Active Trips', value: '142', change: '+8%', icon: Activity, color: 'bg-accent/10', textColor: 'text-accent' },
    { label: 'Total Revenue', value: '₱842,500', change: '+18%', icon: DollarSign, color: 'bg-green-500/10', textColor: 'text-green-500' },
    { label: 'Completion Rate', value: '94.2%', change: '+5%', icon: Percent, color: 'bg-emerald-500/10', textColor: 'text-emerald-500' },
  ];

  const staffMetrics = [
    { name: 'Sarah Johnson', resolvedToday: 28, accuracy: '99%' },
    { name: 'Mike Chen', resolvedToday: 15, accuracy: '97%' },
    { name: 'Lisa Rodriguez', resolvedToday: 42, accuracy: '98%' },
  ];

  const systemAlerts = [
    { type: 'warning', message: 'High dispute rate detected in San Jose Del Monte', time: '1 hour ago' },
    { type: 'info', message: 'Server load at 72%', time: '30 mins ago' },
    { type: 'error', message: '2 vehicles flagged for recheck', time: '15 mins ago' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Platform Overview</h1>
            <p className="text-sm text-muted-foreground mt-2">Strategic metrics and system health</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <div key={index} className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${kpi.color} p-3 rounded-lg`}>
                      <Icon className={`${kpi.textColor} w-6 h-6`} />
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      {kpi.change}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-1">{kpi.label}</p>
                  <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
                </div>
              );
            })}
          </div>

          {/* Staff Performance & System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staff Performance */}
            <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-6">Staff Performance</h3>
              <div className="space-y-4">
                {staffMetrics.map((staff, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{staff.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{staff.resolvedToday}</p>
                      <p className="text-xs text-muted-foreground">resolved • {staff.accuracy} accuracy</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Alerts */}
            <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-6">System Alerts</h3>
              <div className="space-y-3">
                {systemAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-4 rounded-lg ${
                      alert.type === 'error'
                        ? 'bg-destructive/10'
                        : alert.type === 'warning'
                        ? 'bg-orange-500/10'
                        : 'bg-blue-500/10'
                    }`}
                  >
                    <AlertTriangle
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        alert.type === 'error'
                          ? 'text-destructive'
                          : alert.type === 'warning'
                          ? 'text-orange-500'
                          : 'text-blue-500'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>
    </AdminLayout>
  );
}
