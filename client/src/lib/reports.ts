import { supabase } from '@/lib/supabase';
import { logAuditAction } from '@/lib/auditLog';

export type ReportType = 'safety' | 'behavior' | 'payment' | 'feedback' | 'other';
export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';

export interface ReportRow {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  trip_id: string | null;
  report_type: ReportType;
  status: ReportStatus;
  details: string;
  evidence_paths: string[];
  resolution_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  reporter: { display_name: string; avatar_url: string | null } | null;
  reported_user: { display_name: string; avatar_url: string | null } | null;
  trip: { title: string } | null;
}

const SELECT_COLUMNS =
  '*, reporter:profiles!reports_reporter_id_fkey(display_name, avatar_url), reported_user:profiles!reports_reported_user_id_fkey(display_name, avatar_url), trip:trips(title)';

export async function listReports(status?: ReportStatus, reportType?: ReportType) {
  let query = supabase.from('reports').select(SELECT_COLUMNS).order('created_at', { ascending: false });
  if (status) {
    query = query.eq('status', status);
  }
  if (reportType) {
    query = query.eq('report_type', reportType);
  }
  const { data, error } = await query;
  return { data: (data ?? []) as unknown as ReportRow[], error };
}

export async function getReportEvidenceUrl(path: string) {
  const { data, error } = await supabase.storage.from('report-evidence').createSignedUrl(path, 300);
  if (error) return null;
  return data.signedUrl;
}

export async function updateReportStatus(reportId: string, status: ReportStatus, resolutionNotes?: string) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('reports')
    .update({
      status,
      resolution_notes: resolutionNotes?.trim() || null,
      reviewed_by: userData.user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (!error) {
    const actionLabel =
      status === 'resolved'
        ? 'Resolved report'
        : status === 'dismissed'
          ? 'Dismissed report'
          : status === 'reviewing'
            ? 'Started investigating report'
            : 'Updated report status';
    logAuditAction(actionLabel, 'report', reportId, { status, resolution_notes: resolutionNotes ?? null });
  }

  return { error };
}
