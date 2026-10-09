import { useEffect, useState, useCallback, useMemo } from 'react';
import { CheckCircle, Clock, BarChart3, ShieldCheck } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { ImageLightbox } from '@/components/ImageLightbox';
import { listIdVerifications, getSignedImageUrl, reviewIdVerification, type IdVerificationRow, type VerificationStatus } from '@/lib/verification';
import LegalNameCheck from '@/components/LegalNameCheck';
import { useAiResultPoll } from '@/hooks/useAiResultPoll';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { useClientPagination } from '@/hooks/usePagination';
import { AiAddressCheck } from '@/components/AiAddressBadge';
import AiSimilarityBadge from '@/components/AiSimilarityBadge';
import ConfirmActionDialog from '@/components/ConfirmActionDialog';
import { REASON_PRESETS } from '@/lib/reasonPresets';
import {
  DecisionBar,
  DetailHeading,
  DetailPanel,
  EmptyDetail,
  InfoCard,
  InfoRow,
  PhotoViewer,
  QueueItem,
  QueuePanel,
  ReviewPage,
  ReviewToolbar,
  SearchField,
  Segmented,
  StatChip,
  StatusPill,
  neighborId,
  useReviewShortcuts,
} from '@/components/review/ReviewWorkspace';
import { runUndoable } from '@/lib/undoable';
import { formatDateTime } from '@/lib/datetime';

type FilterStatus = 'all' | VerificationStatus;

const STATUS_OPTIONS = (['pending', 'approved', 'rejected', 'all'] as const).map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

export default function AdminIDVerificationReview() {
  const [rawVerifications, setVerifications] = useState<IdVerificationRow[]>([]);
  // Decisions still inside their Undo window, shown as if saved.
  const [statusPatch, setStatusPatch] = useState<Record<string, VerificationStatus>>({});
  const [confirmApprove, setConfirmApprove] = useState<IdVerificationRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [images, setImages] = useState<{ front?: string | null; back?: string | null; selfie?: string | null }>({});
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // `silent` refreshes (realtime / tab focus) keep the list on screen instead of
  // flashing the loading state.
  const loadQueue = useCallback(async (status: FilterStatus, silent = false) => {
    if (!silent) setIsLoading(true);
    const { data } = await listIdVerifications(status === 'all' ? undefined : status);
    setVerifications(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadQueue(filterStatus);
    setSelectedId(null);
  }, [filterStatus, loadQueue]);

  useTableRealtime('id_verifications', () => void loadQueue(filterStatus, true));
  useAiResultPoll(rawVerifications, () => void loadQueue(filterStatus, true));

  const verifications = useMemo(
    () =>
      rawVerifications
        .map((v) => (statusPatch[v.id] ? { ...v, status: statusPatch[v.id] } : v))
        .filter((v) => filterStatus === 'all' || v.status === filterStatus),
    [rawVerifications, statusPatch, filterStatus]
  );

  const queue = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return verifications;
    return verifications.filter((v) =>
      [v.profiles?.display_name, v.profiles?.email].some((field) => field?.toLowerCase().includes(term))
    );
  }, [verifications, searchTerm]);

  const queuePage = useClientPagination(queue, [filterStatus, searchTerm], 25);
  const queueIds = useMemo(() => queue.map((v) => v.id), [queue]);

  // Selecting from the keyboard can land on another page of the queue.
  const selectItem = (id: string | null) => {
    setSelectedId(id);
    const index = id ? queueIds.indexOf(id) : -1;
    if (index >= 0) queuePage.setPage(Math.floor(index / queuePage.pageSize) + 1);
  };

  // Always have something open so the reviewer can start right away.
  useEffect(() => {
    if (!isLoading && queueIds.length && (!selectedId || !queueIds.includes(selectedId))) setSelectedId(queueIds[0]);
  }, [isLoading, queueIds, selectedId]);

  const selected = verifications.find((v) => v.id === selectedId) ?? null;
  const frontPath = selected?.front_image_path ?? null;
  const backPath = selected?.back_image_path ?? null;
  const selfiePath = selected?.selfie_image_path ?? null;
  const hasSelected = selected !== null;

  // Keyed on the paths, not the row object, so a background refresh doesn't
  // re-sign and reload the photos being reviewed.
  useEffect(() => {
    setImages({});
    if (!hasSelected) return;
    let cancelled = false;
    Promise.all([getSignedImageUrl(frontPath), getSignedImageUrl(backPath), getSignedImageUrl(selfiePath)]).then(([front, back, selfie]) => {
      if (!cancelled) setImages({ front, back, selfie });
    });
    return () => {
      cancelled = true;
    };
  }, [hasSelected, selectedId, frontPath, backPath, selfiePath]);

  // Reviews notify and email the traveler, so they're held for the Undo
  // window: Undo means the decision never reached them.
  const review = (row: IdVerificationRow, decision: 'approved' | 'rejected', notes: string) => {
    const name = row.profiles?.display_name ?? 'this traveler';
    runUndoable({
      key: `id-review:${row.id}`,
      message: decision === 'approved' ? `Approving ${name}'s ID…` : `Rejecting ${name}'s ID…`,
      description: 'They get a notification and an email once this saves.',
      onHide: () => {
        setStatusPatch((prev) => ({ ...prev, [row.id]: decision }));
        // Move on to the next submission so the reviewer never has to hunt for it.
        const next = neighborId(queueIds, row.id);
        setSelectedId((current) => (current === row.id ? next : current));
      },
      onRestore: () => setStatusPatch(({ [row.id]: _, ...rest }) => rest),
      commit: () => reviewIdVerification(row.id, decision, notes),
      onCommitted: () =>
        void loadQueue(filterStatus, true).then(() => setStatusPatch(({ [row.id]: _, ...rest }) => rest)),
      success: decision === 'approved' ? `${name}'s ID approved` : `${name}'s ID rejected`,
      error: decision === 'approved' ? 'Failed to approve ID' : 'Failed to reject ID',
    });
  };

  const handleApprove = (id: string) => {
    const row = verifications.find((v) => v.id === id);
    if (row) setConfirmApprove(row);
  };

  const handleRejectClick = (id: string) => {
    setSelectedId(id);
    setShowRejectionModal(true);
  };

  const handleRejectSubmit = (reason: string) => {
    const row = verifications.find((v) => v.id === selectedId);
    if (!row || !reason) return;
    review(row, 'rejected', reason);
  };

  useReviewShortcuts({
    ids: queueIds,
    selectedId,
    onSelect: selectItem,
    onApprove: selected?.status === 'pending' ? () => handleApprove(selected.id) : undefined,
    onReject: selected?.status === 'pending' ? () => handleRejectClick(selected.id) : undefined,
    enabled: !showRejectionModal && !lightboxSrc,
  });

  const stats = useMemo(() => {
    const pending = verifications.filter((v) => v.status === 'pending').length;
    const approved = verifications.filter((v) => v.status === 'approved').length;
    const rejected = verifications.filter((v) => v.status === 'rejected').length;
    const total = verifications.length;
    const approvalRate = total ? Math.round((approved / (approved + rejected || 1)) * 100) : 0;
    return { pending, total, approvalRate };
  }, [verifications]);

  const name = selected?.profiles?.display_name ?? 'Unknown user';

  return (
    <AdminLayout>
      <ReviewPage
        toolbar={
          <ReviewToolbar title="ID Verification" subtitle="Compare each ID with the selfie and the declared legal name">
            <StatChip icon={Clock} label="Pending" value={stats.pending} tone="bg-primary/10 text-primary" />
            <StatChip icon={CheckCircle} label="Approval rate" value={`${stats.approvalRate}%`} tone="bg-green-500/10 text-green-600" />
            <StatChip icon={BarChart3} label="Loaded" value={stats.total} tone="bg-blue-500/10 text-blue-600" />
            <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Search by name or email..." />
            <Segmented value={filterStatus} options={STATUS_OPTIONS} onChange={setFilterStatus} />
          </ReviewToolbar>
        }
      >
        <QueuePanel
          title="Queue"
          count={queue.length}
          isLoading={isLoading}
          emptyText={searchTerm.trim() ? 'No verifications match your search' : 'No verifications to review'}
          pagination={queuePage}
          itemLabel="verifications"
        >
          {queuePage.pageItems.map((v) => (
            <QueueItem
              key={v.id}
              selected={selectedId === v.id}
              onSelect={() => setSelectedId(v.id)}
              title={v.profiles?.display_name ?? 'Unknown user'}
              subtitle={v.profiles?.email}
              status={v.status}
              meta={formatDateTime(v.submitted_at)}
              badges={
                <>
                  <AiSimilarityBadge score={v.ai_similarity_score} flag={v.ai_flag} submittedAt={v.submitted_at} />
                  {v.ai_underage_flag && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 whitespace-nowrap">Age flag</span>
                  )}
                </>
              }
            />
          ))}
        </QueuePanel>

        {selected ? (
          <DetailPanel
            header={
              <DetailHeading name={name} email={selected.profiles?.email}>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-foreground capitalize">
                  {selected.document_type.replace('_', ' ')}
                </span>
                <StatusPill status={selected.status} />
              </DetailHeading>
            }
            footer={
              <DecisionBar
                pending={selected.status === 'pending'}
                onApprove={() => handleApprove(selected.id)}
                onReject={() => handleRejectClick(selected.id)}
                closedNote={
                  <>
                    Already <span className="capitalize font-medium text-foreground">{selected.status}</span>
                  </>
                }
              />
            }
          >
            <div className="grid h-full min-h-0 gap-4 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)_auto] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_17rem] 2xl:grid-rows-[minmax(0,1fr)]">
              <PhotoViewer
                title="ID document"
                photos={[
                  { key: 'front', label: 'Front', src: images.front },
                  ...(selected.back_image_path ? [{ key: 'back', label: 'Back', src: images.back }] : []),
                ]}
                onOpen={setLightboxSrc}
                keyboard
              />
              <PhotoViewer title="Selfie" photos={[{ key: 'selfie', label: 'Selfie', src: images.selfie }]} onOpen={setLightboxSrc} />

              <aside className="min-h-0 grid gap-3 content-start lg:col-span-2 lg:grid-cols-3 2xl:col-span-1 2xl:grid-cols-1 2xl:overflow-y-auto 2xl:overscroll-contain 2xl:-mr-1 2xl:pr-1">
                <div className="[&>div]:mt-0">
                  <LegalNameCheck profile={selected.profiles} />
                </div>
                <InfoCard title="AI checks">
                  <InfoRow label="Face match">
                    <AiSimilarityBadge score={selected.ai_similarity_score} flag={selected.ai_flag} submittedAt={selected.submitted_at} />
                  </InfoRow>
                  <AiAddressCheck
                    flag={selected.ai_address_flag}
                    detected={selected.ai_detected_municipality}
                    declared={selected.profiles?.city ?? null}
                    submittedAt={selected.submitted_at}
                  />
                  {selected.ai_age_low !== null && selected.ai_age_high !== null && (
                    <InfoRow label="Est. age">
                      <span className={selected.ai_underage_flag ? 'text-orange-600' : undefined}>
                        {selected.ai_age_low}-{selected.ai_age_high}
                        {selected.ai_underage_flag ? ' (below 18)' : ''}
                      </span>
                    </InfoRow>
                  )}
                  {selected.ai_error && <p className="text-xs font-medium text-foreground">{selected.ai_error}</p>}
                  <p className="pt-1 text-[11px] italic text-muted-foreground">Advisory only. Always confirm against the photos.</p>
                </InfoCard>
                <InfoCard title="Submission">
                  <InfoRow label="Submitted">{formatDateTime(selected.submitted_at)}</InfoRow>
                  {selected.reviewer_notes && <InfoRow label="Notes">{selected.reviewer_notes}</InfoRow>}
                </InfoCard>
              </aside>
            </div>
          </DetailPanel>
        ) : (
          <EmptyDetail icon={ShieldCheck} text={isLoading ? 'Loading the queue…' : 'Nothing to review here'} />
        )}
      </ReviewPage>

      <ConfirmActionDialog
        open={showRejectionModal}
        onOpenChange={setShowRejectionModal}
        tone="destructive"
        title={`Reject ${selected?.profiles?.display_name ?? 'this'}'s ID?`}
        description="They get a notification and an email with your reason, and can submit a new ID."
        notes={{ label: 'Reason', required: true, placeholder: 'Add details (optional)', presets: REASON_PRESETS.idReject, audience: 'The traveler' }}
        confirmLabel="Reject ID"
        onConfirm={handleRejectSubmit}
      />

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      <ConfirmActionDialog
        open={confirmApprove !== null}
        onOpenChange={(open) => !open && setConfirmApprove(null)}
        title={`Approve ${confirmApprove?.profiles?.display_name ?? 'this'}'s ID?`}
        description="Make sure the name, photo and Bulacan address match. They'll be verified, notified and emailed, and can join trips right away."
        confirmLabel="Approve ID"
        onConfirm={() => {
          if (confirmApprove) review(confirmApprove, 'approved', 'Approved by admin after manual review.');
        }}
      />
    </AdminLayout>
  );
}
