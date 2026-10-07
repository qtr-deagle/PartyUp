import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import { AlertCircle, Car, CheckCircle, Download, ExternalLink, ShieldCheck, Siren, UserPlus, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AiAddressBadge from '@/components/AiAddressBadge';
import AiSimilarityBadge from '@/components/AiSimilarityBadge';
import LegalNameCheck from '@/components/LegalNameCheck';
import { useAiResultPoll } from '@/hooks/useAiResultPoll';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { getSignedImageUrl, listIdVerifications, reviewIdVerification, type IdVerificationRow } from '@/lib/verification';
import { listReports, updateReportStatus, type ReportRow } from '@/lib/reports';
import { type SosAlertDetail } from '@/lib/sos';
import ConfirmActionDialog from '@/components/ConfirmActionDialog';
import ResolveSosDialog, { useSosResolving } from '@/components/sos/ResolveSosDialog';
import { runUndoable, usePendingUndoKeys } from '@/lib/undoable';
import { formatDateTime } from '@/lib/datetime';
import { promoteToStaff, type StaffRole } from '@/lib/adminStaff';
import { getVehiclePhotoUrl, listVehicles, reviewVehicleVerification, type VehicleRow } from '@/lib/vehicles';
import DriverLicensePanel from '@/components/DriverLicensePanel';

type ActionId = 'id' | 'vehicle' | 'report' | 'sos' | 'staff';
type Role = 'admin' | 'guild_leader';

interface AdminQuickActionsProps {
  /** Staff get the vehicle queue instead of Add Staff, and links into /staff pages. */
  role?: Role;
  pendingIdCount: number;
  pendingVehicleCount?: number;
  openReportCount: number;
  sosAlerts: SosAlertDetail[];
  /** Rows for the CSV export; the first row is the header. */
  getExportRows: () => (string | number)[][];
  /** Called after any action changes data, so the dashboard can reload. */
  onChanged: () => void;
}

const inputClass =
  'w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors';
const primaryButton = 'px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors';
const secondaryButton = 'px-4 py-2 rounded-lg text-sm font-semibold border border-border text-foreground hover:bg-secondary transition-colors';
const tileClass =
  'flex items-center gap-3 px-3.5 py-3 rounded-2xl border text-left shadow-elevation-1 transition-smooth hover:shadow-elevation-2 hover:-translate-y-0.5';
const iconChipClass = 'w-9 h-9 rounded-xl flex items-center justify-center shrink-0';

export default function AdminQuickActions({
  role = 'admin',
  pendingIdCount,
  pendingVehicleCount = 0,
  openReportCount,
  sosAlerts,
  getExportRows,
  onChanged,
}: AdminQuickActionsProps) {
  const [openAction, setOpenAction] = useState<ActionId | null>(null);
  const reportsHref = role === 'admin' ? '/admin/support?view=reports' : '/staff/disputes';
  const sosHref = role === 'admin' ? '/admin/sos' : '/staff/sos';
  const close = () => setOpenAction(null);

  const exportCsv = () => {
    const csv = getExportRows()
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `partyup-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Dashboard report downloaded');
  };

  const actions = [
    { id: 'id' as const, label: 'Review Next ID', hint: pendingIdCount > 0 ? `${pendingIdCount} pending` : 'Queue is clear', count: pendingIdCount, icon: ShieldCheck },
    {
      id: 'vehicle' as const,
      label: 'Review Next Vehicle',
      hint: pendingVehicleCount > 0 ? `${pendingVehicleCount} pending` : 'Queue is clear',
      count: pendingVehicleCount,
      icon: Car,
    },
    { id: 'report' as const, label: 'Triage Reports', hint: openReportCount > 0 ? `${openReportCount} open` : 'No open reports', count: openReportCount, icon: AlertCircle },
    // SOS stays red when active: it's an emergency, not just a queue.
    { id: 'sos' as const, label: 'Resolve SOS', hint: sosAlerts.length > 0 ? `${sosAlerts.length} active` : 'No active alerts', count: sosAlerts.length, icon: Siren, urgent: true },
    ...(role === 'admin' ? [{ id: 'staff' as const, label: 'Add Guild Leader', hint: 'Promote by email', count: 0, icon: UserPlus }] : []),
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const needsAttention = action.count > 0;
          // Waiting work is orange (pending); red is kept for danger (active SOS).
          const urgent = 'urgent' in action && action.urgent;
          const tone = urgent
            ? {
                tile: 'bg-destructive/5 border-destructive/30 hover:border-destructive/60',
                chip: 'bg-destructive/10 text-destructive',
                badge: 'bg-destructive text-destructive-foreground',
              }
            : {
                tile: 'bg-orange-500/5 border-orange-500/30 hover:border-orange-500/60',
                chip: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
                badge: 'bg-orange-500 text-white',
              };
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => setOpenAction(action.id)}
              className={`${tileClass} ${
                needsAttention ? tone.tile : 'bg-card border-border/70 hover:border-primary/40'
              }`}
            >
              <span className={`${iconChipClass} ${needsAttention ? tone.chip : 'bg-primary/10 text-primary'}`}>
                <Icon className="w-[18px] h-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{action.label}</p>
                <p className="text-xs text-muted-foreground truncate">{action.hint}</p>
              </div>
              {needsAttention && (
                <span className={`min-w-6 h-6 px-1.5 rounded-full ${tone.badge} text-xs font-bold flex items-center justify-center shrink-0 tabular-nums`}>
                  {action.count > 99 ? '99+' : action.count}
                </span>
              )}
            </button>
          );
        })}
        <button type="button" onClick={exportCsv} className={`${tileClass} bg-card border-border/70 hover:border-primary/40`}>
          <span className={`${iconChipClass} bg-primary/10 text-primary`}>
            <Download className="w-[18px] h-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Export Report</p>
            <p className="text-xs text-muted-foreground truncate">Download CSV</p>
          </div>
        </button>
      </div>

      <Dialog open={openAction !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {openAction === 'id' && <ReviewIdAction role={role} onChanged={onChanged} />}
          {openAction === 'vehicle' && <ReviewVehicleAction onChanged={onChanged} />}
          {openAction === 'report' && <TriageReportAction reportsHref={reportsHref} onChanged={onChanged} />}
          {openAction === 'sos' && <ResolveSosAction alerts={sosAlerts} sosHref={sosHref} />}
          {openAction === 'staff' && <AddStaffAction onDone={close} onChanged={onChanged} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Oldest pending ID first; after each decision the next one loads in place. */
function ReviewIdAction({ role, onChanged }: { role: Role; onChanged: () => void }) {
  const [rawQueue, setQueue] = useState<IdVerificationRow[] | null>(null);
  const pendingKeys = usePendingUndoKeys();
  // Rows inside their Undo window drop out; Undo brings them back.
  const queue = rawQueue?.filter((row) => !pendingKeys.has(`id-review:${row.id}`)) ?? null;
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [images, setImages] = useState<{ front: string | null; back: string | null; selfie: string | null }>({ front: null, back: null, selfie: null });
  const [rejectReason, setRejectReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  // Picking "Other" requires typing the reason; that text is what gets saved.
  const finalRejectReason = rejectReason === 'Other' ? otherReason.trim() : rejectReason;

  const loadQueue = useCallback(async () => {
    const { data, error } = await listIdVerifications('pending');
    if (error) toast.error('Failed to load pending IDs');
    setQueue(data);
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  // Live: new submissions join the queue and AI results replace "AI: pending".
  useTableRealtime('id_verifications', () => void loadQueue());
  useAiResultPoll(rawQueue, () => void loadQueue());

  const current = queue?.[0] ?? null;
  const currentId = current?.id ?? null;
  const frontPath = current?.front_image_path ?? null;
  const backPath = current?.back_image_path ?? null;
  const selfiePath = current?.selfie_image_path ?? null;

  // Keyed on the id and paths, not the row object, so a background refresh
  // (e.g. the AI result landing) keeps the photos and the typed reason.
  useEffect(() => {
    setImages({ front: null, back: null, selfie: null });
    setRejectReason('');
    setOtherReason('');
    if (!currentId) return;
    let cancelled = false;
    Promise.all([getSignedImageUrl(frontPath), getSignedImageUrl(backPath), getSignedImageUrl(selfiePath)]).then(([front, back, selfie]) => {
      if (!cancelled) setImages({ front, back, selfie });
    });
    return () => {
      cancelled = true;
    };
  }, [currentId, frontPath, backPath, selfiePath]);

  // Held for the Undo window (same key as the ID review page), so an
  // undone decision never notifies or emails the traveler.
  const decide = (decision: 'approved' | 'rejected') => {
    if (!current) return;
    const row = current;
    const name = row.profiles?.display_name ?? 'this traveler';
    const notes = decision === 'approved' ? `Approved by ${role === 'admin' ? 'an admin' : 'a Guild Leader'} after manual review.` : finalRejectReason;
    runUndoable({
      key: `id-review:${row.id}`,
      message: decision === 'approved' ? `Approving ${name}'s ID…` : `Rejecting ${name}'s ID…`,
      description: 'They get a notification and an email once this saves.',
      commit: () => reviewIdVerification(row.id, decision, notes),
      onCommitted: onChanged,
      success: decision === 'approved' ? `${name}'s ID approved` : `${name}'s ID rejected`,
      error: decision === 'approved' ? 'Failed to approve ID' : 'Failed to reject ID',
    });
  };

  if (queue === null) {
    return <DialogHeader><DialogTitle>Review Next ID</DialogTitle><DialogDescription>Loading queue...</DialogDescription></DialogHeader>;
  }
  if (!current) {
    return <EmptyAction title="Review Next ID" message="No pending ID verifications. The queue is clear." />;
  }

  const photos = [
    { label: 'Front of ID', src: images.front, path: current.front_image_path },
    { label: 'Selfie', src: images.selfie, path: current.selfie_image_path },
    { label: 'Back of ID', src: images.back, path: current.back_image_path },
  ].filter((photo) => photo.path);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Review Next ID</DialogTitle>
        <DialogDescription>
          {current.profiles?.display_name ?? 'Unknown user'} · {current.document_type.replace('_', ' ')} · submitted {formatDateTime(current.submitted_at)} ·{' '}
          {queue.length} in queue
        </DialogDescription>
      </DialogHeader>

      <LegalNameCheck profile={current.profiles} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {photos.map((photo) => (
          <div key={photo.label}>
            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">{photo.label}</p>
            <div className="bg-secondary rounded-lg overflow-hidden h-40 flex items-center justify-center border border-border">
              {photo.src ? (
                <a href={photo.src} target="_blank" rel="noreferrer" title="Open full size">
                  <img src={photo.src} alt={photo.label} className="h-40 w-full object-contain" />
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">Loading...</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <AiSimilarityBadge score={current.ai_similarity_score} flag={current.ai_flag} submittedAt={current.submitted_at} />
        <AiAddressBadge
          flag={current.ai_address_flag}
          detected={current.ai_detected_municipality}
          declared={current.profiles?.city ?? null}
          submittedAt={current.submitted_at}
        />
        {current.ai_age_low !== null && current.ai_age_high !== null && (
          <span className={`text-xs ${current.ai_underage_flag ? 'text-orange-600 font-semibold' : 'text-muted-foreground'}`}>
            Est. age {current.ai_age_low}-{current.ai_age_high}
            {current.ai_underage_flag ? ' (below 18, verify carefully)' : ''}
          </span>
        )}
        <span className="text-xs text-muted-foreground italic">AI is advisory only.</span>
      </div>

      <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className={inputClass}>
        <option value="">Rejection reason (required to reject)...</option>
        <option value="Poor image quality">Poor image quality</option>
        <option value="Face does not match ID">Face does not match ID</option>
        <option value="Invalid or expired ID">Invalid or expired ID</option>
        <option value="Face or ID obscured">Face or ID obscured</option>
        <option value="Name does not match ID">Name does not match ID</option>
        <option value="Other">Other</option>
      </select>
      {rejectReason === 'Other' && (
        <textarea
          value={otherReason}
          onChange={(e) => setOtherReason(e.target.value)}
          placeholder="Describe the reason (the user will see this)"
          rows={3}
          autoFocus
          className={`${inputClass} resize-none`}
        />
      )}

      <DialogFooter>
        <button onClick={() => decide('rejected')} disabled={!finalRejectReason} className={`${primaryButton} bg-red-600 hover:bg-red-700 flex items-center gap-2`}>
          <XCircle className="w-4 h-4" /> Reject
        </button>
        <button onClick={() => setConfirmApprove(true)} className={`${primaryButton} bg-green-600 hover:bg-green-700 flex items-center gap-2`}>
          <CheckCircle className="w-4 h-4" /> Approve
        </button>
      </DialogFooter>

      <ConfirmActionDialog
        open={confirmApprove}
        onOpenChange={setConfirmApprove}
        title={`Approve ${current.profiles?.display_name ?? 'this'}'s ID?`}
        description="Make sure the name, photo and Bulacan address match. They'll be verified, notified and emailed, and can join trips right away."
        confirmLabel="Approve ID"
        onConfirm={() => decide('approved')}
      />
    </>
  );
}

/** Oldest open report first: resolve or dismiss with notes, or skip to the next. */
function TriageReportAction({ reportsHref, onChanged }: { reportsHref: string; onChanged: () => void }) {
  const [rawQueue, setQueue] = useState<ReportRow[] | null>(null);
  const pendingKeys = usePendingUndoKeys();
  const queue = rawQueue?.filter((row) => !pendingKeys.has(`report:${row.id}`)) ?? null;
  const [deciding, setDeciding] = useState<'resolved' | 'dismissed' | null>(null);
  // Skipped reports stay out of the queue when a live refetch brings them back.
  const skippedRef = useRef(new Set<string>());

  const loadQueue = useCallback(async () => {
    const { data, error } = await listReports('open');
    if (error) toast.error('Failed to load reports');
    setQueue([...data].reverse().filter((r) => !skippedRef.current.has(r.id)));
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  useTableRealtime('reports', () => void loadQueue());

  const current = queue?.[0] ?? null;

  const next = () => {
    if (!current) return;
    const skippedId = current.id;
    skippedRef.current.add(skippedId);
    setQueue((q) => (q ? q.filter((r) => r.id !== skippedId) : q));
  };

  // Held for the Undo window (same key as the Support page), so an undone
  // decision never messages the reporter.
  const decide = (status: 'resolved' | 'dismissed', notes: string) => {
    if (!current) return;
    const report = current;
    runUndoable({
      key: `report:${report.id}`,
      message: status === 'resolved' ? 'Resolving report…' : 'Dismissing report…',
      description: 'The reporter is told once this saves.',
      commit: () => updateReportStatus(report.id, status, notes),
      onCommitted: onChanged,
      success: status === 'resolved' ? 'Report resolved. The reporter got a reply.' : 'Report dismissed. The reporter got a reply.',
      error: 'Failed to update report',
    });
  };

  if (queue === null) {
    return <DialogHeader><DialogTitle>Triage Reports</DialogTitle><DialogDescription>Loading reports...</DialogDescription></DialogHeader>;
  }
  if (!current) {
    return <EmptyAction title="Triage Reports" message="No open reports left to triage." linkLabel="Open Reports page" linkHref={reportsHref} />;
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="capitalize">{current.report_type} report</DialogTitle>
        <DialogDescription>
          Filed {formatDateTime(current.created_at)} · {queue.length} open
        </DialogDescription>
      </DialogHeader>

      <div className="bg-secondary rounded-lg p-3 space-y-2 border border-border text-sm">
        <Row label="Reporter" value={current.reporter?.display_name ?? 'Unknown'} />
        <Row label="Reported user" value={current.reported_user?.display_name ?? '—'} />
        {current.trip && <Row label="Trip" value={current.trip.title} />}
        {current.guild && <Row label="Guild" value={`${current.guild.name} (escalated guild report — audit log on Reports page)`} />}
        {current.evidence_paths.length > 0 && <Row label="Evidence" value={`${current.evidence_paths.length} file(s) — view on Reports page`} />}
      </div>
      <p className="text-sm text-foreground whitespace-pre-wrap">{current.details}</p>

      <DialogFooter>
        <button onClick={next} className={secondaryButton}>
          Skip
        </button>
        <button onClick={() => setDeciding('dismissed')} className={`${primaryButton} bg-slate-600 hover:bg-slate-700`}>
          Dismiss
        </button>
        <button onClick={() => setDeciding('resolved')} className={`${primaryButton} bg-green-600 hover:bg-green-700`}>
          Resolve
        </button>
      </DialogFooter>

      <ConfirmActionDialog
        open={deciding !== null}
        onOpenChange={(open) => !open && setDeciding(null)}
        tone={deciding === 'dismissed' ? 'destructive' : 'default'}
        title={deciding === 'resolved' ? 'Resolve this report?' : 'Dismiss this report?'}
        description={
          deciding === 'resolved'
            ? 'The report is closed as handled and the reporter gets your notes as a reply.'
            : 'The report is closed with no action and the reporter gets your notes as a reply.'
        }
        notes={{ label: 'Notes for the reporter', required: true, placeholder: 'What was done? The reporter sees this in their ticket.' }}
        confirmLabel={deciding === 'resolved' ? 'Resolve report' : 'Dismiss report'}
        onConfirm={(notes) => {
          if (deciding) decide(deciding, notes);
        }}
      />
    </>
  );
}

/** Active alerts come from the dashboard's realtime hook, so resolved ones drop out on their own. */
function ResolveSosAction({ alerts, sosHref }: { alerts: SosAlertDetail[]; sosHref: string }) {
  const [resolving, setResolving] = useState<SosAlertDetail | null>(null);
  const isResolving = useSosResolving();

  if (alerts.length === 0) {
    return <EmptyAction title="Resolve SOS" message="No active SOS alerts right now." linkLabel="Open SOS Center" linkHref={sosHref} />;
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Resolve SOS</DialogTitle>
        <DialogDescription>
          Only resolve once the traveler is confirmed safe. For the live map and location trail, use the{' '}
          <Link href={sosHref} className="text-primary hover:underline">
            SOS Center
          </Link>
          .
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-3 rounded-lg border border-destructive/30 bg-destructive/10">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{alert.profile?.display_name ?? 'Unknown user'}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {formatDateTime(alert.created_at)}
                  {alert.trip ? ` · ${alert.trip.origin} → ${alert.trip.destination}` : ''}
                  {alert.profile?.phone ? ` · ${alert.profile.phone}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {alert.latitude !== null && alert.longitude !== null && (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${alert.latitude}&mlon=${alert.longitude}#map=17/${alert.latitude}/${alert.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Map <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {isResolving(alert.id) ? (
                  <span className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold">Resolving…</span>
                ) : (
                  <button onClick={() => setResolving(alert)} className={`${primaryButton} bg-destructive hover:bg-destructive/90 py-1.5`}>
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ResolveSosDialog
        alert={resolving ? { id: resolving.id, created_at: resolving.created_at, name: resolving.profile?.display_name ?? null } : null}
        onClose={() => setResolving(null)}
      />
    </>
  );
}

const VEHICLE_REJECT_REASONS = [
  'Poor image quality',
  'Photos do not match vehicle details',
  'Plate or OR/CR unreadable',
  'Vehicle or documents look suspicious',
  'Owner authorization incomplete or invalid',
  'Other',
];

/** Oldest pending vehicle first; after each decision the next one loads in place. */
function ReviewVehicleAction({ onChanged }: { onChanged: () => void }) {
  const [queue, setQueue] = useState<VehicleRow[] | null>(null);
  const [photos, setPhotos] = useState<{ label: string; src: string | null }[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  // Picking "Other" requires typing the reason; that text is what gets saved.
  const finalRejectReason = rejectReason === 'Other' ? otherReason.trim() : rejectReason;

  const loadQueue = useCallback(async () => {
    const { data, error } = await listVehicles('pending');
    if (error) toast.error('Failed to load pending vehicles');
    setQueue(data);
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  // Live: new submissions join the queue; another admin's decision drops theirs.
  useTableRealtime('vehicles', () => void loadQueue());

  const current = queue?.[0] ?? null;
  const currentId = current?.id ?? null;
  // A live refetch returns a new object for the same vehicle; read it through a
  // ref so the photos and the chosen reject reason only reset when the vehicle changes.
  const currentRef = useRef(current);
  currentRef.current = current;

  useEffect(() => {
    const current = currentRef.current;
    setRejectReason('');
    setOtherReason('');
    if (!current) {
      setPhotos([]);
      return;
    }
    const slots = [
      { label: 'Exterior', path: current.exterior_image_path },
      { label: 'OR/CR', path: current.orcr_image_path },
      { label: 'Plate', path: current.plate_image_path },
      { label: 'Authorization letter', path: current.authorization_letter_path },
      { label: 'Owner ID (front)', path: current.owner_id_front_path },
      { label: 'Owner ID (back)', path: current.owner_id_back_path },
      { label: 'Owner signatures', path: current.owner_signatures_path },
    ].filter((slot) => slot.path);
    setPhotos(slots.map((slot) => ({ label: slot.label, src: null })));
    let cancelled = false;
    Promise.all(slots.map((slot) => getVehiclePhotoUrl(slot.path))).then((urls) => {
      if (!cancelled) setPhotos(slots.map((slot, i) => ({ label: slot.label, src: urls[i] })));
    });
    return () => {
      cancelled = true;
    };
  }, [currentId]);

  const decide = (decision: 'approved' | 'rejected') => {
    if (!current) return;
    const row = current;
    const name = row.profiles?.display_name ?? 'this traveler';
    const notes = decision === 'approved' ? 'Approved by an admin after manual review.' : finalRejectReason;
    runUndoable({
      key: `vehicle-review:${row.id}`,
      message: decision === 'approved' ? `Approving ${name}'s vehicle…` : `Rejecting ${name}'s vehicle…`,
      description: 'They get a notification and an email once this saves.',
      onHide: () => setQueue((q) => (q ? q.filter((v) => v.id !== row.id) : q)),
      onRestore: () => setQueue((q) => (q ? [row, ...q.filter((v) => v.id !== row.id)] : q)),
      commit: () => reviewVehicleVerification(row.id, decision, notes),
      onCommitted: onChanged,
      success: decision === 'approved' ? 'Vehicle approved' : 'Vehicle rejected',
      error: decision === 'approved' ? 'Failed to approve vehicle' : 'Failed to reject vehicle',
    });
  };

  if (queue === null) {
    return <DialogHeader><DialogTitle>Review Next Vehicle</DialogTitle><DialogDescription>Loading queue...</DialogDescription></DialogHeader>;
  }
  if (!current) {
    return <EmptyAction title="Review Next Vehicle" message="No pending vehicle verifications. The queue is clear." linkLabel="Open Vehicles page" linkHref="/admin/vehicles" />;
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Review Next Vehicle</DialogTitle>
        <DialogDescription>
          {current.profiles?.display_name ?? 'Unknown user'} · submitted {current.submitted_at ? formatDateTime(current.submitted_at) : '—'} ·{' '}
          {queue.length} in queue
        </DialogDescription>
      </DialogHeader>

      <div className="bg-secondary rounded-lg p-3 space-y-2 border border-border text-sm">
        <Row label="Vehicle" value={[current.year, current.make, current.model].filter(Boolean).join(' ')} />
        <Row label="Color" value={current.color ?? '—'} />
        <Row label="Plate" value={current.plate_number ?? '—'} />
        <Row label="Ownership" value={current.ownership_type === 'borrowed' ? 'Borrowed (needs owner authorization)' : 'Owned'} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo) => (
          <div key={photo.label}>
            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase truncate">{photo.label}</p>
            <div className="bg-secondary rounded-lg overflow-hidden h-32 flex items-center justify-center border border-border">
              {photo.src ? (
                <a href={photo.src} target="_blank" rel="noreferrer" title="Open full size">
                  <img src={photo.src} alt={photo.label} className="h-32 w-full object-contain" />
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">Loading...</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Approving the vehicle also approves this pending license. */}
      <div className="border-t border-border pt-4">
        <DriverLicensePanel key={current.user_id} userId={current.user_id} onOpenImage={(src) => window.open(src, '_blank', 'noreferrer')} />
      </div>

      <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className={inputClass}>
        <option value="">Rejection reason (required to reject)...</option>
        {VEHICLE_REJECT_REASONS.map((reason) => (
          <option key={reason} value={reason}>
            {reason}
          </option>
        ))}
      </select>
      {rejectReason === 'Other' && (
        <textarea
          value={otherReason}
          onChange={(e) => setOtherReason(e.target.value)}
          placeholder="Describe the reason (the user will see this)"
          rows={3}
          autoFocus
          className={`${inputClass} resize-none`}
        />
      )}

      <DialogFooter>
        <button onClick={() => decide('rejected')} disabled={!finalRejectReason} className={`${primaryButton} bg-red-600 hover:bg-red-700 flex items-center gap-2`}>
          <XCircle className="w-4 h-4" /> Reject
        </button>
        <button onClick={() => decide('approved')} className={`${primaryButton} bg-green-600 hover:bg-green-700 flex items-center gap-2`}>
          <CheckCircle className="w-4 h-4" /> Approve
        </button>
      </DialogFooter>
    </>
  );
}

function AddStaffAction({ onDone, onChanged }: { onDone: () => void; onChanged: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('guild_leader');
  const [confirming, setConfirming] = useState(false);
  const target = email.trim();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (target) setConfirming(true);
  };

  const promote = () => {
    const label = role === 'admin' ? 'an admin' : 'a Guild Leader';
    runUndoable({
      key: `promote:${target.toLowerCase()}`,
      message: `Making ${target} ${label}…`,
      commit: () => promoteToStaff(target, role),
      onCommitted: onChanged,
      success: `${target} is now ${label}`,
      error: 'Could not promote',
    });
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Add Guild Leader</DialogTitle>
        <DialogDescription>Promote an existing PartyUp account. They need to have signed up first.</DialogDescription>
      </DialogHeader>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" className={inputClass} autoFocus />
      <select value={role} onChange={(e) => setRole(e.target.value as StaffRole)} className={inputClass}>
        <option value="guild_leader">Guild Leader: founds and runs a guild</option>
        <option value="admin">Admin: full access to this console</option>
      </select>
      <DialogFooter>
        <button type="submit" disabled={!target} className={`${primaryButton} bg-primary hover:bg-primary/90`}>
          Promote
        </button>
      </DialogFooter>

      <ConfirmActionDialog
        open={confirming}
        onOpenChange={setConfirming}
        tone={role === 'admin' ? 'destructive' : 'default'}
        title={role === 'admin' ? 'Give full admin access?' : 'Make this traveler a Guild Leader?'}
        description={
          role === 'admin'
            ? 'Admins can see ID documents, change roles and run the platform. They leave any guild they are in.'
            : `${target} skips the application and can found and run a guild right away.`
        }
        typeToConfirm={role === 'admin' ? target : undefined}
        confirmLabel={role === 'admin' ? 'Make admin' : 'Make Guild Leader'}
        onConfirm={promote}
      />
    </form>
  );
}

function EmptyAction({ title, message, linkLabel, linkHref }: { title: string; message: string; linkLabel?: string; linkHref?: string }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{message}</DialogDescription>
      </DialogHeader>
      {linkHref && (
        <DialogFooter>
          <Link href={linkHref} className={secondaryButton}>
            {linkLabel}
          </Link>
        </DialogFooter>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}
