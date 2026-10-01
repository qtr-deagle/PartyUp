import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Link } from 'wouter';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Activity, AlertTriangle, Clock, Percent, Plane, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'sonner';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import {
  getAnalyticsMetrics,
  getDashboardCounts,
  getStaffResolutionCounts,
  getTopDestinations,
  getWeeklyTripsAndDisputes,
  type AnalyticsMetrics,
  type DashboardCounts,
  type DestinationCount,
  type StaffResolutionCount,
  type WeekBucket,
} from '@/lib/adminStats';
import { listReports, type ReportRow } from '@/lib/reports';
import { useActiveSosAlerts } from '@/hooks/useSosRealtime';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import AdminQuickActions from '@/components/AdminQuickActions';

// Validated for CVD separation and contrast against the light (#FFFFFF) and dark (#1E293B) card surfaces.
const weeklyChartConfig = {
  trips: { label: 'Trips', theme: { light: '#2563EB', dark: '#3B82F6' } },
  disputes: { label: 'Disputes', theme: { light: '#EA580C', dark: '#EA580C' } },
} satisfies ChartConfig;

/**
 * Admin Dashboard - Strategic Overview + Analytics
 *
 * Admin can see:
 * - Key business metrics (KPIs) and items needing attention
 * - Weekly trips vs disputes and top destinations
 * - Staff performance and recent open reports
 */
export default function AdminDashboard() {
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeekBucket[]>([]);
  const [topDestinations, setTopDestinations] = useState<DestinationCount[]>([]);
  const [staffMetrics, setStaffMetrics] = useState<StaffResolutionCount[]>([]);
  const [recentReports, setRecentReports] = useState<ReportRow[]>([]);
  const [openReportCount, setOpenReportCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { alerts: activeSosAlerts } = useActiveSosAlerts();

  // Only the first load shows the loading state; later refreshes (after a quick
  // action) update in place so an open quick-action dialog stays mounted.
  const loadDashboard = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    else setIsRefreshing(true);
    const [countsResult, metricsResult, weeklyResult, destinationsResult, staffResult, reportsResult] = await Promise.all([
      getDashboardCounts(),
      getAnalyticsMetrics(),
      getWeeklyTripsAndDisputes(8),
      getTopDestinations(5),
      getStaffResolutionCounts(),
      listReports('open'),
    ]);
    const error =
      countsResult.error ?? metricsResult.error ?? weeklyResult.error ?? destinationsResult.error ?? staffResult.error ?? reportsResult.error;
    if (error) {
      // A failed background refresh keeps the last good data on screen.
      if (isInitial) setLoadError(error.message);
      toast.error('Failed to load dashboard data');
    } else {
      setLoadError(null);
      setCounts(countsResult.data);
      setMetrics(metricsResult.data);
      setWeeklyData(weeklyResult.data);
      setTopDestinations(destinationsResult.data);
      setStaffMetrics(staffResult.data);
      setRecentReports(reportsResult.data.slice(0, 5));
      setOpenReportCount(reportsResult.data.length);
    }
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    void loadDashboard(true);
  }, [loadDashboard]);

  // Every stat on this page comes from these three tables (pending ID
  // verifications are profiles.verification_status).
  useTableRealtime(['reports', 'profiles', 'trips'], () => void loadDashboard());

  const getExportRows = () => {
    const rows: (string | number)[][] = [['Section', 'Metric', 'Value']];
    for (const kpi of kpis) rows.push(['Overview', kpi.label, kpi.value], ['Overview', `${kpi.label} (detail)`, kpi.sub]);
    rows.push(['Attention', 'Open reports', openReportCount], ['Attention', 'Active SOS alerts', activeSosAlerts.length]);
    for (const week of weeklyData) rows.push(['Weekly', `${week.weekLabel} trips`, week.trips], ['Weekly', `${week.weekLabel} disputes`, week.disputes]);
    for (const d of topDestinations) rows.push(['Top destinations', d.destination, `${d.count} trips (${d.pct.toFixed(1)}%)`]);
    for (const s of staffMetrics) rows.push(['Guild Leader resolved today', s.displayName, s.resolvedToday]);
    return rows;
  };

  const kpis =
    counts && metrics
      ? [
          {
            label: 'Total Users',
            value: counts.totalUsers.toLocaleString(),
            sub: `+${metrics.newUsersThisWeek.toLocaleString()} this week`,
            icon: Users,
            color: 'bg-primary/10',
            textColor: 'text-primary',
          },
          { label: 'Active Trips', value: counts.activeTrips.toLocaleString(), sub: 'Open or ongoing', icon: Activity, color: 'bg-accent/10', textColor: 'text-accent' },
          { label: 'Total Trips', value: counts.totalTrips.toLocaleString(), sub: 'All time', icon: Plane, color: 'bg-sky-500/10', textColor: 'text-sky-500' },
          {
            label: 'Completion Rate',
            value: counts.totalTrips > 0 ? `${metrics.completionRatePct.toFixed(1)}%` : '—',
            sub: `${counts.completedTrips.toLocaleString()} completed`,
            icon: Percent,
            color: 'bg-emerald-500/10',
            textColor: 'text-emerald-500',
          },
          {
            label: 'Pending IDs',
            value: counts.pendingVerifications.toLocaleString(),
            sub: 'Awaiting review',
            icon: ShieldCheck,
            color: 'bg-blue-500/10',
            textColor: 'text-blue-500',
          },
          {
            label: 'Avg Resolution',
            value: metrics.avgResolutionHours !== null ? `${metrics.avgResolutionHours.toFixed(1)}h` : '—',
            sub: 'Per dispute',
            icon: Clock,
            color: 'bg-orange-500/10',
            textColor: 'text-orange-500',
          },
        ]
      : [];

  const hasWeeklyActivity = weeklyData.some((week) => week.trips > 0 || week.disputes > 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Overview</h1>
          <p className="text-sm text-muted-foreground mt-2">Strategic metrics, trends, and system health</p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        ) : loadError ? (
          <p className="text-sm text-destructive">Failed to load dashboard data: {loadError}</p>
        ) : (
          <>
            {/* KPI Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {kpis.map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.label} className="bg-card rounded-2xl p-4 shadow-elevation-2 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`${kpi.color} p-2 rounded-lg`}>
                        <Icon className={`${kpi.textColor} w-4 h-4`} />
                      </div>
                      <p className="text-muted-foreground text-xs font-medium truncate">{kpi.label}</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{kpi.sub}</p>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <AdminQuickActions
              pendingIdCount={counts?.pendingVerifications ?? 0}
              openReportCount={openReportCount}
              sosAlerts={activeSosAlerts}
              getExportRows={getExportRows}
              onChanged={() => void loadDashboard()}
              isRefreshing={isRefreshing}
            />

            {/* Trends & Destinations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-foreground">Trips vs Disputes</h3>
                  <p className="text-xs text-muted-foreground">New trips and reports filed per week, last 8 weeks</p>
                </div>
                {hasWeeklyActivity ? (
                  <ChartContainer config={weeklyChartConfig} className="aspect-auto h-64 w-full">
                    <BarChart data={weeklyData} barGap={2} margin={{ left: -16, right: 4, top: 4 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="weekLabel" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
                      <ChartTooltip cursor content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="trips" fill="var(--color-trips)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                      <Bar dataKey="disputes" fill="var(--color-disputes)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <p className="h-64 flex items-center justify-center text-sm text-muted-foreground">No trips or reports in the last 8 weeks</p>
                )}
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border flex flex-col">
                <h3 className="text-lg font-bold text-foreground">Top Destinations</h3>
                <p className="text-xs text-muted-foreground mb-4">Share of all trips</p>
                <div className="space-y-3 flex-1">
                  {topDestinations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No trip data yet</p>
                  ) : (
                    topDestinations.map((destination) => (
                      <div key={destination.destination}>
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground truncate">{destination.destination}</p>
                          <p className="text-xs text-muted-foreground shrink-0">
                            {destination.count} · {destination.pct.toFixed(0)}%
                          </p>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${destination.pct}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-baseline justify-between mb-1">
                    <p className="text-sm text-muted-foreground">Trip Completion Rate</p>
                    <p className="text-sm font-semibold text-foreground">{metrics!.completionRatePct.toFixed(1)}%</p>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${metrics!.completionRatePct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Staff Performance & Recent Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">Guild Leader Performance Today</h3>
                  <Link href="/admin/staff" className="text-xs font-medium text-primary hover:underline">
                    View all →
                  </Link>
                </div>
                <div className="space-y-2">
                  {staffMetrics.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No reports resolved yet today</p>
                  ) : (
                    staffMetrics.map((staff) => (
                      <div key={staff.staffId} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <p className="text-sm font-medium text-foreground">{staff.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">{staff.resolvedToday}</span> resolved
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">Recent Open Reports</h3>
                  <Link href="/admin/reports" className="text-xs font-medium text-primary hover:underline">
                    View all →
                  </Link>
                </div>
                <div className="space-y-2">
                  {recentReports.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No open reports</p>
                  ) : (
                    recentReports.map((report) => (
                      <div key={report.id} className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground capitalize truncate">
                            {report.report_type} — {report.reported_user?.display_name ?? 'Unknown user'}
                          </p>
                          <p className="text-xs text-muted-foreground">{new Date(report.created_at).toLocaleString()}</p>
                        </div>
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
