import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { TrendingUp, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  getAnalyticsMetrics,
  getWeeklyTripsAndDisputes,
  getTopDestinations,
  type AnalyticsMetrics,
  type WeekBucket,
  type DestinationCount,
} from '@/lib/adminStats';

/**
 * Admin Analytics - Business Intelligence
 *
 * Admin can see:
 * - Trip and user growth
 * - Trip completion rates
 * - Dispute resolution metrics
 * - Top destinations
 */
export default function AdminAnalytics() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeekBucket[]>([]);
  const [topDestinations, setTopDestinations] = useState<DestinationCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const [metricsResult, weeklyResult, destinationsResult] = await Promise.all([
        getAnalyticsMetrics(),
        getWeeklyTripsAndDisputes(),
        getTopDestinations(5),
      ]);
      const error = metricsResult.error ?? weeklyResult.error ?? destinationsResult.error;
      if (error) {
        setLoadError(error.message);
        toast.error('Failed to load analytics');
      } else {
        setLoadError(null);
        setMetrics(metricsResult.data);
        setWeeklyData(weeklyResult.data);
        setTopDestinations(destinationsResult.data);
      }
      setIsLoading(false);
    })();
  }, []);

  const metricCards = metrics
    ? [
        { label: 'Total Trips', value: metrics.totalTrips.toLocaleString(), period: 'All time', icon: TrendingUp, color: 'bg-green-500/10', textColor: 'text-green-500' },
        { label: 'New Users', value: `+${metrics.newUsersThisWeek.toLocaleString()}`, period: 'Last 7 days', icon: Users, color: 'bg-blue-500/10', textColor: 'text-blue-500' },
        { label: 'Trip Completion', value: `${metrics.completionRatePct.toFixed(1)}%`, period: 'All time', icon: TrendingUp, color: 'bg-primary/10', textColor: 'text-primary' },
        {
          label: 'Avg Resolution',
          value: metrics.avgResolutionHours !== null ? `${metrics.avgResolutionHours.toFixed(1)}h` : '—',
          period: 'Disputes',
          icon: Clock,
          color: 'bg-orange-500/10',
          textColor: 'text-orange-500',
        },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-2">Key business metrics and performance trends</p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        ) : loadError ? (
          <p className="text-sm text-destructive">Failed to load analytics: {loadError}</p>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metricCards.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div key={index} className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`${metric.color} p-3 rounded-lg`}>
                        <Icon className={`${metric.textColor} w-6 h-6`} />
                      </div>
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
                    {weeklyData.map((row, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{row.weekLabel}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{row.trips}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">{row.disputes}</span>
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
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${metrics!.completionRatePct}%` }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{metrics!.completionRatePct.toFixed(1)}% completion</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Top Destinations</h3>
                <div className="space-y-3">
                  {topDestinations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No trip data yet</p>
                  ) : (
                    topDestinations.map((destination) => (
                      <div key={destination.destination} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-foreground">{destination.destination}</p>
                          <p className="text-xs text-muted-foreground">{destination.count} trips</p>
                        </div>
                        <span className="text-sm font-semibold text-primary">{destination.pct.toFixed(1)}%</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
