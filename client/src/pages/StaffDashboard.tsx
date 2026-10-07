import React, { useCallback, useEffect, useState } from 'react';
import StaffLayout from '@/components/StaffLayout';
import { Link } from 'wouter';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { AlertCircle, Car, CheckCircle, CheckSquare, ChevronRight, ExternalLink, Plane, ShieldCheck, Siren, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import AdminQuickActions from '@/components/AdminQuickActions';
import { listReports, type ReportRow } from '@/lib/reports';
import { getDashboardCounts, getStaffResolutionCounts, getWeeklyTripsAndDisputes, type StaffResolutionCount, type WeekBucket } from '@/lib/adminStats';
import { listIdVerifications, type IdVerificationRow } from '@/lib/verification';
import { listVehicles, type VehicleRow } from '@/lib/vehicles';
import { useActiveSosAlerts } from '@/hooks/useSosRealtime';
import { useTableRealtime } from '@/hooks/useTableRealtime';

// Same series colors as the admin dashboard chart.
const weeklyChartConfig = {
  trips: { label: 'Trips', theme: { light: '#2563EB', dark: '#3B82F6' } },
  disputes: { label: 'Disputes', theme: { light: '#EA580C', dark: '#EA580C' } },
} satisfies ChartConfig;

function timeAgo(iso: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/**
 * Staff Dashboard
 *
 * Staff can:
 * - See live SOS alerts and resolve them in place
 * - Work the ID, vehicle and report queues from quick-action dialogs
 * - Track weekly trips vs disputes and the team's resolutions today
 */
export default function StaffDashboard() {
  const [openReports, setOpenReports] = useState<ReportRow[]>([]);
  const [reviewingCount, setReviewingCount] = useState(0);
  const [activeTrips, setActiveTrips] = useState(0);
  const [pendingIds, setPendingIds] = useState<IdVerificationRow[]>([]);
  const [pendingVehicles, setPendingVehicles] = useState<VehicleRow[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeekBucket[]>([]);
  const [teamToday, setTeamToday] = useState<StaffResolutionCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { alerts: activeSosAlerts } = useActiveSosAlerts();

  // Only the first load shows the loading state; later refreshes (realtime,
  // tab focus, after a quick action) update in place so an open dialog stays mounted.
  const loadDashboard = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    else setIsRefreshing(true);
    const [openResult, reviewingResult, countsResult, idsResult, vehiclesResult, weeklyResult, teamResult] = await Promise.all([
      listReports('open'),
      listReports('reviewing'),
      getDashboardCounts(),
      listIdVerifications('pending'),
      listVehicles('pending'),
      getWeeklyTripsAndDisputes(8),
      getStaffResolutionCounts(),
    ]);
    const error =
      openResult.error ??
      reviewingResult.error ??
      countsResult.error ??
      idsResult.error ??
      vehiclesResult.error ??
      weeklyResult.error ??
      teamResult.error;
    if (error) {
      // A failed background refresh keeps the last good data on screen.
      if (isInitial) {
        setLoadError(error.message);
        toast.error('Failed to load dashboard data');
      }
    } else {
      setLoadError(null);
      setOpenReports(openResult.data);
      setReviewingCount(reviewingResult.data.length);
      setActiveTrips(countsResult.data.activeTrips);
      setPendingIds(idsResult.data);
      setPendingVehicles(vehiclesResult.data);
      setWeeklyData(weeklyResult.data);
      setTeamToday(teamResult.data);
    }
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    void loadDashboard(true);
  }, [loadDashboard]);

  useTableRealtime(['reports', 'id_verifications', 'vehicles', 'trips'], () => void loadDashboard());

  const safetyReports = openReports.filter((report) => report.report_type === 'safety');
  const hasWeeklyActivity = weeklyData.some((week) => week.trips > 0 || week.disputes > 0);
  const resolvedTodayTotal = teamToday.reduce((sum, staff) => sum + staff.resolvedToday, 0);

  const stats = [
    { label: 'Active SOS', value: activeSosAlerts.length, icon: Siren, color: 'bg-destructive/10', textColor: 'text-destructive', href: '/staff/sos' },
    { label: 'Pending Reports', value: openReports.length, icon: AlertCircle, color: 'bg-destructive/10', textColor: 'text-destructive', href: '/staff/disputes' },
    { label: 'Open Disputes', value: reviewingCount, icon: CheckSquare, color: 'bg-orange-500/10', textColor: 'text-orange-500', href: '/staff/disputes' },
    { label: 'Pending IDs', value: pendingIds.length, icon: ShieldCheck, color: 'bg-primary/10', textColor: 'text-primary', href: '/staff/verification' },
    { label: 'Pending Vehicles', value: pendingVehicles.length, icon: Car, color: 'bg-orange-500/10', textColor: 'text-orange-500', href: '/staff/vehicles' },
    { label: 'Active Trips', value: activeTrips, icon: Plane, color: 'bg-accent/10', textColor: 'text-accent', href: '/staff/trips' },
  ];

  const getExportRows = () => {
    const rows: (string | number)[][] = [['Section', 'Metric', 'Value']];
    for (const stat of stats) rows.push(['Overview', stat.label, stat.value]);
    for (const week of weeklyData) rows.push(['Weekly', `${week.weekLabel} trips`, week.trips], ['Weekly', `${week.weekLabel} disputes`, week.disputes]);
    for (const staff of teamToday) rows.push(['Resolved today', staff.displayName, staff.resolvedToday]);
    return rows;
  };

  // Oldest first, mixed across both verification queues.
  const verificationQueue = [
    ...pendingIds.map((row) => ({
      key: `id-${row.id}`,
      kind: 'ID' as const,
      name: row.profiles?.display_name ?? 'Unknown user',
      detail: row.document_type.replace('_', ' '),
      submittedAt: row.submitted_at,
      href: '/staff/verification',
    })),
    ...pendingVehicles.map((row) => ({
      key: `vehicle-${row.id}`,
      kind: 'Vehicle' as const,
      name: row.profiles?.display_name ?? 'Unknown user',
      detail: [row.make, row.model, row.plate_number].filter(Boolean).join(' · '),
      submittedAt: row.submitted_at ?? row.created_at,
      href: '/staff/vehicles',
    })),
  ]
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))
    .slice(0, 6);

  return (
    <StaffLayout>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Guild Leader Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-2">Real-time safety monitoring and moderation</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        ) : loadError ? (
          <p className="text-sm text-destructive">Failed to load dashboard data: {loadError}</p>
        ) : (
          <>
            {/* Live SOS */}
            {activeSosAlerts.length > 0 ? (
              <div className="bg-destructive/10 border-2 border-destructive rounded-2xl p-6 shadow-elevation-2">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Siren className="w-6 h-6 text-destructive animate-pulse" />
                    <h2 className="text-lg font-bold text-destructive">{activeSosAlerts.length} ACTIVE SOS</h2>
                  </div>
                  <Link href="/staff/sos" className="text-sm font-semibold text-destructive hover:underline flex items-center gap-1">
                    Open SOS Center <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeSosAlerts.slice(0, 4).map((alert) => (
                    <div key={alert.id} className="bg-card border border-destructive/30 rounded-lg p-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{alert.profile?.display_name ?? 'Unknown user'}</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {alert.trigger_reason === 'auto_escalation' ? 'Warning Mode escalated' : 'Manual SOS'} · {timeAgo(alert.created_at)}
                          {alert.trip ? ` · ${alert.trip.origin} → ${alert.trip.destination}` : ''}
                        </p>
                        {alert.profile?.phone && <p className="text-xs font-medium text-foreground mt-1">{alert.profile.phone}</p>}
                      </div>
                      {alert.latitude !== null && alert.longitude !== null && (
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${alert.latitude}&mlon=${alert.longitude}#map=17/${alert.latitude}/${alert.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Map <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-6 py-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-sm text-foreground">
                  <span className="font-semibold">All clear.</span> No active SOS alerts. New alerts appear here instantly.
                </p>
              </div>
            )}

            {/* Safety reports */}
            {safetyReports.length > 0 && (
              <div className="bg-destructive/10 border-2 border-destructive rounded-2xl p-6 shadow-elevation-2">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                  <h2 className="text-lg font-bold text-destructive">OPEN SAFETY REPORTS</h2>
                </div>
                <div className="space-y-3">
                  {safetyReports.map((report) => (
                    <div key={report.id} className="bg-destructive/5 border border-destructive/30 rounded-lg p-4 flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-destructive">{report.reported_user?.display_name ?? 'Unknown user'}</p>
                        <p className="text-sm text-muted-foreground mt-1">{report.details}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mt-2">{new Date(report.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Link
                    key={stat.label}
                    href={stat.href}
                    className="bg-card rounded-2xl p-4 shadow-elevation-2 border border-border hover:border-primary/50 transition-smooth"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`${stat.color} p-2 rounded-lg`}>
                        <Icon className={`${stat.textColor} w-4 h-4`} />
                      </div>
                      <p className="text-muted-foreground text-xs font-medium truncate">{stat.label}</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions: open dialogs that do the work in place */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3">Quick Actions</h3>
              <AdminQuickActions
                role="guild_leader"
                pendingIdCount={pendingIds.length}
                pendingVehicleCount={pendingVehicles.length}
                openReportCount={openReports.length}
                sosAlerts={activeSosAlerts}
                getExportRows={getExportRows}
                onChanged={() => void loadDashboard()}
              />
            </div>

            {/* Trends & Team */}
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
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-bold text-foreground">Team Today</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  {resolvedTodayTotal.toLocaleString()} report{resolvedTodayTotal === 1 ? '' : 's'} resolved or dismissed today
                </p>
                <div className="space-y-2 flex-1">
                  {teamToday.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No reports closed yet today. Use Triage Reports above to get started.</p>
                  ) : (
                    teamToday.map((staff, index) => (
                      <div key={staff.staffId} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <p className="text-sm font-medium text-foreground truncate">
                          <span className="text-muted-foreground mr-2">#{index + 1}</span>
                          {staff.displayName}
                        </p>
                        <p className="text-sm text-muted-foreground shrink-0">
                          <span className="font-semibold text-foreground">{staff.resolvedToday}</span> closed
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Queues */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Moderation Queue</h3>
                  </div>
                  <Link href="/staff/disputes" className="text-xs font-medium text-primary hover:underline">
                    View all →
                  </Link>
                </div>
                <div className="space-y-2">
                  {openReports.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No open reports</p>
                  ) : (
                    openReports.slice(0, 6).map((report) => (
                      <div key={report.id} className="flex items-start justify-between gap-3 p-3 bg-secondary rounded-lg border border-border">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground capitalize truncate">
                            {report.report_type} — {report.details}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            Reported by {report.reporter?.display_name ?? 'Unknown'}
                            {report.reported_user ? ` · against ${report.reported_user.display_name}` : ''}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground shrink-0">{timeAgo(report.created_at)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Verification Queue</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Oldest first</p>
                </div>
                <div className="space-y-2">
                  {verificationQueue.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No IDs or vehicles waiting for review</p>
                  ) : (
                    verificationQueue.map((item) => (
                      <Link
                        key={item.key}
                        href={item.href}
                        className="flex items-center justify-between gap-3 p-3 bg-secondary rounded-lg border border-border hover:border-primary/50 transition-smooth"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              item.kind === 'ID' ? 'bg-primary/10 text-primary' : 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300'
                            }`}
                          >
                            {item.kind}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground capitalize truncate">{item.detail || '—'}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground shrink-0">waiting {timeAgo(item.submittedAt).replace(' ago', '')}</p>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </StaffLayout>
  );
}
