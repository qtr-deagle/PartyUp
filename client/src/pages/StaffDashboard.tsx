import React, { useEffect, useState } from 'react';
import StaffLayout from '@/components/StaffLayout';
import { AlertCircle, CheckSquare, ShieldCheck, Plane } from 'lucide-react';
import { toast } from 'sonner';
import { listReports, type ReportRow } from '@/lib/reports';
import { getDashboardCounts } from '@/lib/adminStats';

/**
 * Staff Dashboard
 *
 * Staff can:
 * - Monitor pending reports and disputes
 * - Monitor active trips
 * - Access quick actions for common tasks
 */
export default function StaffDashboard() {
  const [openReports, setOpenReports] = useState<ReportRow[]>([]);
  const [reviewingCount, setReviewingCount] = useState(0);
  const [activeTrips, setActiveTrips] = useState(0);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const [openResult, reviewingResult, countsResult] = await Promise.all([
        listReports('open'),
        listReports('reviewing'),
        getDashboardCounts(),
      ]);
      const error = openResult.error ?? reviewingResult.error ?? countsResult.error;
      if (error) {
        setLoadError(error.message);
        toast.error('Failed to load dashboard data');
      } else {
        setLoadError(null);
        setOpenReports(openResult.data);
        setReviewingCount(reviewingResult.data.length);
        setActiveTrips(countsResult.data.activeTrips);
        setPendingVerifications(countsResult.data.pendingVerifications);
      }
      setIsLoading(false);
    })();
  }, []);

  const safetyReports = openReports.filter((report) => report.report_type === 'safety');

  const stats = [
    { label: 'Pending Reports', value: openReports.length.toLocaleString(), icon: AlertCircle, color: 'bg-destructive/10', textColor: 'text-destructive' },
    { label: 'Open Disputes', value: reviewingCount.toLocaleString(), icon: CheckSquare, color: 'bg-orange-500/10', textColor: 'text-orange-500' },
    { label: 'Pending ID Verifications', value: pendingVerifications.toLocaleString(), icon: ShieldCheck, color: 'bg-primary/10', textColor: 'text-primary' },
    { label: 'Active Trips', value: activeTrips.toLocaleString(), icon: Plane, color: 'bg-accent/10', textColor: 'text-accent' },
  ];

  return (
    <StaffLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-2">Real-time safety monitoring and moderation</p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        ) : loadError ? (
          <p className="text-sm text-destructive">Failed to load dashboard data: {loadError}</p>
        ) : (
          <>
            {/* SAFETY REPORTS - Prominent Red Section */}
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

            {/* Moderation Queue */}
            <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Moderation Queue</h3>
              </div>
              <div className="space-y-3">
                {openReports.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No open reports</p>
                ) : (
                  openReports.slice(0, 10).map((report) => (
                    <div key={report.id} className="flex items-start justify-between p-4 bg-secondary rounded-lg border border-border">
                      <div className="flex-1">
                        <p className="font-medium text-foreground capitalize">
                          {report.report_type} — {report.details}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Reported by: {report.reporter?.display_name ?? 'Unknown'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mt-2">{new Date(report.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button className="w-full py-3 px-4 bg-destructive text-destructive-foreground rounded-lg font-medium hover:shadow-lg transition-smooth">
                  Review Reports
                </button>
                <button className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth">
                  Handle Disputes
                </button>
                <button className="w-full py-3 px-4 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-smooth border border-border">
                  Monitor Trips
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </StaffLayout>
  );
}
