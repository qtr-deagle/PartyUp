import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Link } from 'wouter';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  MapPin,
  Percent,
  Plane,
  ShieldCheck,
  Siren,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useAuth } from '@/contexts/AuthContext';
import AdminQuickActions from '@/components/AdminQuickActions';

// Validated for CVD separation and contrast against the light (#FFFFFF) and dark (#1E293B) card surfaces.
const weeklyChartConfig = {
  trips: { label: 'Trips', theme: { light: '#2563EB', dark: '#3B82F6' } },
  disputes: { label: 'Disputes', theme: { light: '#EA580C', dark: '#EA580C' } },
} satisfies ChartConfig;

const cardClass = 'bg-card rounded-2xl border border-border/70 shadow-elevation-1 transition-smooth hover:shadow-elevation-2';

/** Stagger delay for the `animate-admin-rise` fade-up entrance. */
const riseIn = (index: number): React.CSSProperties => ({ animationDelay: `${index * 50}ms` });

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days < 30 ? `${days}d ago` : new Date(iso).toLocaleDateString();
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join('') || '?'
  );
}

function SectionHeader({ icon: Icon, title, subtitle, href }: { icon: LucideIcon; title: string; subtitle?: string; href?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-foreground tracking-tight truncate">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary shrink-0 rounded-full px-3 py-1.5 bg-secondary/60 hover:bg-primary/10 transition-smooth"
        >
          View all
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

function CompletionRing({ pct }: { pct: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="8" className="stroke-secondary" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-accent transition-all duration-700 ease-out"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">{clamped.toFixed(0)}%</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 rounded-3xl bg-secondary" />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl bg-secondary" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-80 rounded-2xl bg-secondary" />
        <Skeleton className="h-80 rounded-2xl bg-secondary" />
      </div>
    </div>
  );
}

/**
 * Admin Dashboard - Strategic Overview + Analytics
 *
 * Admin can see:
 * - Key business metrics (KPIs) and items needing attention
 * - Weekly trips vs disputes and top destinations
 * - Staff performance and recent open reports
 */
export default function AdminDashboard() {
  const { user } = useAuth();
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
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
      setLastUpdated(new Date());
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
            positive: metrics.newUsersThisWeek > 0,
            icon: Users,
            tint: 'bg-primary/10 text-primary',
          },
          {
            label: 'Active Trips',
            value: counts.activeTrips.toLocaleString(),
            sub: 'Open or ongoing',
            icon: Activity,
            tint: 'bg-accent/10 text-accent',
          },
          {
            label: 'Total Trips',
            value: counts.totalTrips.toLocaleString(),
            sub: 'All time',
            icon: Plane,
            tint: 'bg-primary/10 text-primary',
          },
          {
            label: 'Completion Rate',
            value: counts.totalTrips > 0 ? `${metrics.completionRatePct.toFixed(1)}%` : '—',
            sub: `${counts.completedTrips.toLocaleString()} completed`,
            icon: Percent,
            tint: 'bg-accent/10 text-accent',
          },
          {
            label: 'Pending IDs',
            value: counts.pendingVerifications.toLocaleString(),
            sub: 'Awaiting review',
            icon: ShieldCheck,
            tint: 'bg-primary/10 text-primary',
          },
          {
            label: 'Avg Resolution',
            value: metrics.avgResolutionHours !== null ? `${metrics.avgResolutionHours.toFixed(1)}h` : '—',
            sub: 'Per dispute',
            icon: Clock,
            tint: 'bg-primary/10 text-primary',
          },
        ]
      : [];

  const hasWeeklyActivity = weeklyData.some((week) => week.trips > 0 || week.disputes > 0);
  const maxResolved = Math.max(1, ...staffMetrics.map((s) => s.resolvedToday));
  const attentionItems = [
    { label: 'SOS alerts', value: activeSosAlerts.length, icon: Siren, urgent: activeSosAlerts.length > 0 },
    { label: 'Open reports', value: openReportCount, icon: AlertTriangle, urgent: false },
    { label: 'Pending IDs', value: counts?.pendingVerifications ?? 0, icon: ShieldCheck, urgent: false },
  ];
  const needsAttention = attentionItems.some((item) => item.value > 0);
  const firstName = user?.name?.split(' ')[0];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 animate-admin-rise">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">
              {greeting()}
              {firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Here's what's happening across PartyUp</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-elevation-1">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-accent" />
            </span>
            {isRefreshing
              ? 'Updating…'
              : lastUpdated
                ? `Live · updated ${lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                : 'Live'}
          </div>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : loadError ? (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Couldn't load the dashboard</p>
              <p className="text-sm text-muted-foreground mt-0.5">{loadError}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Attention banner */}
            <div className={`${cardClass} p-6 animate-admin-rise`} style={riseIn(1)}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      needsAttention ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                    }`}
                  >
                    {needsAttention ? <Sparkles className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-foreground">
                      {needsAttention ? 'A few things need your attention' : "You're all caught up"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {needsAttention ? 'Use the quick actions below to clear the queues.' : 'No pending IDs, open reports, or active SOS alerts.'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:min-w-[420px]">
                  {attentionItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className={`rounded-2xl px-4 py-3 border ${item.urgent ? 'bg-destructive/10 border-destructive/30' : 'bg-secondary border-transparent'}`}
                      >
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${item.urgent ? 'text-destructive' : 'text-muted-foreground'}`}>
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${item.urgent ? 'animate-pulse' : ''}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <p className={`text-2xl font-bold tracking-tight mt-1 ${item.urgent ? 'text-destructive' : 'text-foreground'}`}>
                          {item.value.toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* KPI Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {kpis.map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                  <div
                    key={kpi.label}
                    className={`${cardClass} p-5 hover:-translate-y-0.5 animate-admin-rise`}
                    style={riseIn(index + 2)}
                  >
                    <div className={`w-10 h-10 rounded-xl ${kpi.tint} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-muted-foreground text-xs font-medium mt-4 truncate">{kpi.label}</p>
                    <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5 tabular-nums">{kpi.value}</p>
                    <p
                      className={`inline-flex mt-2 max-w-full truncate rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        kpi.positive ? 'bg-accent/10 text-accent' : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {kpi.sub}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="animate-admin-rise" style={riseIn(8)}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Quick actions</h2>
              <AdminQuickActions
                pendingIdCount={counts?.pendingVerifications ?? 0}
                openReportCount={openReportCount}
                sosAlerts={activeSosAlerts}
                getExportRows={getExportRows}
                onChanged={() => void loadDashboard()}
                isRefreshing={isRefreshing}
              />
            </div>

            {/* Trends & Destinations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-2 ${cardClass} p-6 animate-admin-rise`} style={riseIn(9)}>
                <SectionHeader icon={BarChart3} title="Trips vs Disputes" subtitle="New trips and reports filed per week, last 8 weeks" />
                {hasWeeklyActivity ? (
                  <ChartContainer config={weeklyChartConfig} className="aspect-auto h-72 w-full">
                    <BarChart data={weeklyData} barGap={4} margin={{ left: -16, right: 4, top: 4 }}>
                      <CartesianGrid vertical={false} strokeDasharray="4 4" />
                      <XAxis dataKey="weekLabel" tickLine={false} axisLine={false} tickMargin={10} interval="preserveStartEnd" />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
                      <ChartTooltip cursor content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="trips" fill="var(--color-trips)" radius={[6, 6, 2, 2]} maxBarSize={26} />
                      <Bar dataKey="disputes" fill="var(--color-disputes)" radius={[6, 6, 2, 2]} maxBarSize={26} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-72 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-center">
                    <BarChart3 className="w-8 h-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No trips or reports in the last 8 weeks</p>
                  </div>
                )}
              </div>

              <div className={`${cardClass} p-6 flex flex-col animate-admin-rise`} style={riseIn(10)}>
                <SectionHeader icon={MapPin} title="Top Destinations" subtitle="Share of all trips" />
                <div className="space-y-4 flex-1">
                  {topDestinations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No trip data yet</p>
                  ) : (
                    topDestinations.map((destination, index) => (
                      <div key={destination.destination} className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            index === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2 mb-1.5">
                            <p className="text-sm font-medium text-foreground truncate">{destination.destination}</p>
                            <p className="text-xs text-muted-foreground shrink-0 tabular-nums">
                              {destination.count} · {destination.pct.toFixed(0)}%
                            </p>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full bg-primary transition-all duration-700 ease-out"
                              style={{ width: `${destination.pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-6 pt-5 border-t border-border/70 flex items-center gap-4">
                  <CompletionRing pct={metrics!.completionRatePct} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Trip Completion Rate</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {counts!.completedTrips.toLocaleString()} of {counts!.totalTrips.toLocaleString()} trips completed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Staff Performance & Recent Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`${cardClass} p-6 animate-admin-rise`} style={riseIn(11)}>
                <SectionHeader icon={Trophy} title="Guild Leader Performance" subtitle="Reports resolved today" href="/admin/staff" />
                <div className="space-y-1">
                  {staffMetrics.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                      <Trophy className="w-8 h-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No reports resolved yet today</p>
                    </div>
                  ) : (
                    staffMetrics.map((staff, index) => (
                      <div key={staff.staffId} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/60 transition-smooth">
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                            {initials(staff.displayName)}
                          </div>
                          {index === 0 && staff.resolvedToday > 0 && (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 ring-2 ring-card flex items-center justify-center">
                              <Trophy className="w-2.5 h-2.5 text-amber-900" />
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{staff.displayName}</p>
                            <p className="text-xs text-muted-foreground shrink-0">
                              <span className="font-semibold text-foreground tabular-nums">{staff.resolvedToday}</span> resolved
                            </p>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-1 mt-1.5 overflow-hidden">
                            <div className="h-1 rounded-full bg-primary" style={{ width: `${(staff.resolvedToday / maxResolved) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className={`${cardClass} p-6 animate-admin-rise`} style={riseIn(12)}>
                <SectionHeader
                  icon={AlertTriangle}
                  title="Recent Open Reports"
                  subtitle={`${openReportCount.toLocaleString()} open in total`}
                  href="/admin/support?view=reports"
                />
                <div className="space-y-1">
                  {recentReports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                      <CheckCircle2 className="w-8 h-8 text-accent/60" />
                      <p className="text-sm text-muted-foreground">No open reports</p>
                    </div>
                  ) : (
                    recentReports.map((report) => (
                      <div key={report.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/60 transition-smooth">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{report.reported_user?.display_name ?? 'Unknown user'}</p>
                          <span className="inline-flex mt-0.5 rounded-full bg-orange-500/10 px-2 py-0.5 text-[11px] font-medium capitalize text-orange-600 dark:text-orange-400">
                            {report.report_type}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground shrink-0" title={new Date(report.created_at).toLocaleString()}>
                          {timeAgo(report.created_at)}
                        </p>
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
