import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Users, Activity, AlertTriangle, Percent, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { getDashboardCounts, getStaffResolutionCounts, type DashboardCounts, type StaffResolutionCount } from '@/lib/adminStats';
import { listReports, type ReportRow } from '@/lib/reports';

/**
 * Admin Dashboard - Strategic Overview
 *
 * Admin can see:
 * - Key business metrics (KPIs)
 * - Staff performance metrics
 * - Recent open reports
 */
export default function AdminDashboard() {
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [staffMetrics, setStaffMetrics] = useState<StaffResolutionCount[]>([]);
  const [recentReports, setRecentReports] = useState<ReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const [countsResult, staffResult, reportsResult] = await Promise.all([
        getDashboardCounts(),
        getStaffResolutionCounts(),
        listReports('open'),
      ]);
      const error = countsResult.error ?? staffResult.error ?? reportsResult.error;
      if (error) {
        setLoadError(error.message);
        toast.error('Failed to load dashboard data');
      } else {
        setLoadError(null);
        setCounts(countsResult.data);
        setStaffMetrics(staffResult.data);
        setRecentReports(reportsResult.data.slice(0, 5));
      }
      setIsLoading(false);
    })();
  }, []);

  const kpis = counts
    ? [
        { label: 'Total Users', value: counts.totalUsers.toLocaleString(), icon: Users, color: 'bg-primary/10', textColor: 'text-primary' },
        { label: 'Active Trips', value: counts.activeTrips.toLocaleString(), icon: Activity, color: 'bg-accent/10', textColor: 'text-accent' },
        {
          label: 'Pending Verifications',
          value: counts.pendingVerifications.toLocaleString(),
          icon: ShieldCheck,
          color: 'bg-blue-500/10',
          textColor: 'text-blue-500',
        },
        {
          label: 'Completion Rate',
          value: counts.totalTrips > 0 ? `${((counts.completedTrips / counts.totalTrips) * 100).toFixed(1)}%` : '—',
          icon: Percent,
          color: 'bg-emerald-500/10',
          textColor: 'text-emerald-500',
        },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Platform Overview</h1>
            <p className="text-sm text-muted-foreground mt-2">Strategic metrics and system health</p>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading dashboard...</p>
          ) : loadError ? (
            <p className="text-sm text-destructive">Failed to load dashboard data: {loadError}</p>
          ) : (
            <>
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
                      </div>
                      <p className="text-muted-foreground text-sm mb-1">{kpi.label}</p>
                      <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Staff Performance & Recent Reports */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Staff Performance */}
                <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-6">Staff Performance Today</h3>
                  <div className="space-y-4">
                    {staffMetrics.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No reports resolved yet today</p>
                    ) : (
                      staffMetrics.map((staff) => (
                        <div key={staff.staffId} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{staff.displayName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">{staff.resolvedToday}</p>
                            <p className="text-xs text-muted-foreground">resolved today</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Open Reports */}
                <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-6">Recent Open Reports</h3>
                  <div className="space-y-3">
                    {recentReports.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No open reports</p>
                    ) : (
                      recentReports.map((report) => (
                        <div key={report.id} className="flex items-start gap-3 p-4 rounded-lg bg-orange-500/10">
                          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground capitalize">
                              {report.report_type} — {report.reported_user?.display_name ?? 'Unknown user'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(report.created_at).toLocaleString()}</p>
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
