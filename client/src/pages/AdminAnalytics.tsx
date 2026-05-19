import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { BarChart3, TrendingUp, Users, Clock, AlertCircle } from 'lucide-react';

/**
 * Admin Analytics - Business Intelligence
 * 
 * Admin can see:
 * - Revenue reports
 * - User growth charts
 * - Trip completion rates
 * - Dispute resolution metrics
 * - Safety incident trends
 */
export default function AdminAnalytics() {
  const metrics = [
    { label: 'Total Trips', value: '2,847', change: '+18%', period: 'This month', icon: TrendingUp, color: 'bg-green-500/10', textColor: 'text-green-500' },
    { label: 'New Users', value: '+342', change: '+23%', period: 'This month', icon: Users, color: 'bg-blue-500/10', textColor: 'text-blue-500' },
    { label: 'Trip Completion', value: '94.2%', change: '+2%', period: 'This month', icon: TrendingUp, color: 'bg-primary/10', textColor: 'text-primary' },
    { label: 'Avg Resolution', value: '2.4h', change: '-18%', period: 'Disputes', icon: Clock, color: 'bg-orange-500/10', textColor: 'text-orange-500' },
  ];

  const chartData = [
    { week: 'Week 1', trips: 340, disputes: 12 },
    { week: 'Week 2', trips: 421, disputes: 8 },
    { week: 'Week 3', trips: 385, disputes: 15 },
    { week: 'Week 4', trips: 512, disputes: 10 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-2">Key business metrics and performance trends</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${metric.color} p-3 rounded-lg`}>
                      <Icon className={`${metric.textColor} w-6 h-6`} />
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs mb-1">{metric.period}</p>
                  <p className="text-2xl font-bold text-foreground mb-1">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              );
            })}
          </div>

          {/* Data Table */}
          <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Weekly Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-border bg-secondary">
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Period</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Trips</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Disputes</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{row.week}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{row.trips}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                          {row.disputes}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Key Metrics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Trip Completion Rate</p>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">94.2% completion</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">User Retention</p>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">92% retention rate</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Platform Uptime</p>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '99.8%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">99.8% uptime</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Top Regions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">New York</p>
                    <p className="text-xs text-muted-foreground">342 trips</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">28.4%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Los Angeles</p>
                    <p className="text-xs text-muted-foreground">289 trips</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">23.1%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Chicago</p>
                    <p className="text-xs text-muted-foreground">215 trips</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">17.2%</span>
                </div>
              </div>
            </div>
          </div>
      </div>
    </AdminLayout>
  );
}
