import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Users, Plane, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import Weather from '@/components/Weather';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '1,234', icon: Users, color: 'bg-blue-100', textColor: 'text-blue-600' },
    { label: 'Active Trips', value: '456', icon: Plane, color: 'bg-green-100', textColor: 'text-green-600' },
    { label: 'Reports', value: '23', icon: AlertCircle, color: 'bg-red-100', textColor: 'text-red-600' },
    { label: 'Revenue', value: '$12.5K', icon: TrendingUp, color: 'bg-purple-100', textColor: 'text-purple-600' },
  ];

  const recentActivity = [
    { id: 1, user: 'John Doe', action: 'Created new trip', time: '2 hours ago' },
    { id: 2, user: 'Jane Smith', action: 'Matched with buddy', time: '4 hours ago' },
    { id: 3, user: 'Mike Johnson', action: 'Submitted report', time: '6 hours ago' },
    { id: 4, user: 'Sarah Williams', action: 'Completed trip', time: '1 day ago' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Weather Widget */}
          <Weather />

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Recent Activity</h3>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth">
                Review Reports
              </button>
              <button className="w-full py-3 px-4 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-smooth border border-border">
                Manage Users
              </button>
              <button className="w-full py-3 px-4 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-smooth border border-border">
                View Analytics
              </button>
              <button className="w-full py-3 px-4 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-smooth border border-border">
                System Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
