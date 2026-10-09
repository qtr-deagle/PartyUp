import { useEffect, useState, useCallback, useMemo } from 'react';
import { CheckCircle, Clock, BarChart3, Car, IdCard } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { ImageLightbox } from '@/components/ImageLightbox';
import {
  listVehicles,
  getVehiclePhotoUrl,
  reviewVehicleVerification,
  listLicenseOnlyQueue,
  reviewDriverLicense,
  type DriverLicense,
  type VehicleRow,
  type VehicleVerificationStatus,
} from '@/lib/vehicles';
import DriverLicensePanel from '@/components/DriverLicensePanel';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { useClientPagination } from '@/hooks/usePagination';
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
  type ViewerPhoto,
} from '@/components/review/ReviewWorkspace';
import { runUndoable } from '@/lib/undoable';
import { formatDateTime } from '@/lib/datetime';

/**
 * Vehicle Verification (admin, routed at /admin/vehicles)
 *
 * Admins can:
 * - Review travelers' personal vehicles submitted for verification
 * - Inspect the exterior, OR/CR, and plate photos
 * - For borrowed vehicles, also inspect the owner's letter of authorization,
 *   both sides of the owner's ID, and the owner's 3 specimen signatures
 * - Approve or reject with a note back to the traveler
 * - Browse past decisions by status (all / pending / approved / rejected)
 * - See the traveler's driver's license (photos, auto-check, QR result) with
 *   every vehicle; approving the vehicle approves a pending license too
 * - "Driver's licenses" tab: licenses submitted without a vehicle (license
 *   only, or a reused verified-ID license whose QR check didn't pass), which
 *   would otherwise never get reviewed
 *
 * Fixed-height review workspace (see ReviewWorkspace): every document sits in
 * one photo viewer, so the page itself never scrolls while reviewing.
 */
// 'unverified' vehicles were never submitted, so they never show up here.
type FilterStatus = 'all' | Exclude<VehicleVerificationStatus, 'unverified'>;

// undefined = loading, null = not provided.
type VehicleImages = Partial<
  Record<'exterior' | 'orcr' | 'plate' | 'authorizationLetter' | 'ownerIdFront' | 'ownerIdBack' | 'ownerSignatures', string | null>
>;
type LicensePhotos = { front?: string | null; back?: string | null } | null;

const STATUS_OPTIONS = (['pending', 'approved', 'rejected', 'all'] as const).map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

function matchesSearch(term: string, fields: (string | null | undefined)[]) {
  return !term || fields.some((field) => field?.toLowerCase().includes(term));
}

function licenseViewerPhotos(photos: LicensePhotos | undefined): ViewerPhoto[] {
  if (photos === null) return [];
  return [
    { key: 'license-front', label: 'License front', src: photos?.front },
    { key: 'license-back', label: 'License back', src: photos?.back },
  ];
}

export default function StaffVehicles() {
  const [rawVehicles, setVehicles] = useState<VehicleRow[]>([]);
  // Decisions still inside their Undo window, shown as if saved.
  const [statusPatch, setStatusPatch] = useState<Record<string, VehicleVerificationStatus>>({});
  const [confirmApprove, setConfirmApprove] = useState<VehicleRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [images, setImages] = useState<VehicleImages>({});
  const [licensePhotos, setLicensePhotos] = useState<LicensePhotos | undefined>(undefined);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [view, setView] = useState<'vehicles' | 'licenses'>('vehicles');
  const [licenseQueue, setLicenseQueue] = useState<DriverLicense[]>([]);
  const [licensesLoading, setLicensesLoading] = useState(true);
  const [selectedLicenseUser, setSelectedLicenseUser] = useState<string | null>(null);
  const [licenseDecision, setLicenseDecision] = useState<{ license: DriverLicense; decision: 'approved' | 'rejected' } | null>(null);
  const [hiddenLicenses, setHiddenLicenses] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const term = searchTerm.trim().toLowerCase();

  // `silent` refreshes (realtime / tab focus) keep the list on screen instead of
  // flashing the loading state.
  const loadQueue = useCallback(async (status: FilterStatus, silent = false) => {
    if (!silent) setIsLoading(true);
    const { data } = await listVehicles(status === 'all' ? undefined : status);
    setVehicles(data.filter((v) => v.verification_status !== 'unverified'));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadQueue(filterStatus);
    setSelectedId(null);
  }, [filterStatus, loadQueue]);

  useTableRealtime('vehicles', () => void loadQueue(filterStatus, true));

  const loadLicenses = useCallback(async (silent = false) => {
    if (!silent) setLicensesLoading(true);
    const { data } = await listLicenseOnlyQueue();
    setLicenseQueue(data);
    setLicensesLoading(false);
  }, []);

  useEffect(() => {
    void loadLicenses();
  }, [loadLicenses]);

  // A vehicle decision can settle a license too, so both tables refresh it.
  useTableRealtime(['driver_licenses', 'vehicles'], () => void loadLicenses(true));

  const shownLicenses = licenseQueue.filter((l) => !hiddenLicenses.has(l.user_id));
  const licenseMatches = useMemo(
    () => shownLicenses.filter((l) => matchesSearch(term, [l.profiles?.display_name, l.profiles?.email])),
    [shownLicenses, term]
  );
  const licensePage = useClientPagination(licenseMatches, [term], 25);
  const licenseIds = useMemo(() => licenseMatches.map((l) => l.user_id), [licenseMatches]);
  const selectedLicense = licenseMatches.find((l) => l.user_id === selectedLicenseUser) ?? null;

  const unhideLicense = (userId: string) =>
    setHiddenLicenses((prev) => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });

  // Same Undo window as vehicle reviews: the traveler is notified on save.
  const decideLicense = (license: DriverLicense, decision: 'approved' | 'rejected', notes: string) => {
    const name = license.profiles?.display_name ?? 'this traveler';
    const next = neighborId(licenseIds, license.user_id);
    runUndoable({
      key: `license-review:${license.user_id}`,
      message: decision === 'approved' ? `Approving ${name}'s driver's license…` : `Rejecting ${name}'s driver's license…`,
      description: 'They get a notification once this saves.',
      onHide: () => {
        setHiddenLicenses((prev) => new Set(prev).add(license.user_id));
        setSelectedLicenseUser((current) => (current === license.user_id ? next : current));
      },
      onRestore: () => unhideLicense(license.user_id),
      commit: () => reviewDriverLicense(license.user_id, decision, notes),
      onCommitted: () => void loadLicenses(true).then(() => unhideLicense(license.user_id)),
      success: decision === 'approved' ? `${name}'s driver's license approved` : `${name}'s driver's license rejected`,
      error: decision === 'approved' ? 'Failed to approve license' : 'Failed to reject license',
    });
  };

  const vehicles = useMemo(
    () =>
      rawVehicles
        .map((v) => (statusPatch[v.id] ? { ...v, verification_status: statusPatch[v.id] } : v))
        .filter((v) => filterStatus === 'all' || v.verification_status === filterStatus),
    [rawVehicles, statusPatch, filterStatus]
  );

  const queue = useMemo(
    () => vehicles.filter((v) => matchesSearch(term, [v.profiles?.display_name, v.profiles?.email, `${v.make} ${v.model}`, v.plate_number])),
    [vehicles, term]
  );
  const queuePage = useClientPagination(queue, [filterStatus, term], 25);
  const queueIds = useMemo(() => queue.map((v) => v.id), [queue]);

  // Always have something open so the reviewer can start right away.
  useEffect(() => {
    if (!isLoading && queueIds.length && (!selectedId || !queueIds.includes(selectedId))) setSelectedId(queueIds[0]);
  }, [isLoading, queueIds, selectedId]);
  useEffect(() => {
    if (!licensesLoading && licenseIds.length && (!selectedLicenseUser || !licenseIds.includes(selectedLicenseUser))) {
      setSelectedLicenseUser(licenseIds[0]);
    }
  }, [licensesLoading, licenseIds, selectedLicenseUser]);

  const selected = queue.find((v) => v.id === selectedId) ?? null;
  // Changes only when the reviewed vehicle or its documents change, so a
  // background refresh doesn't re-sign and reload the photos on screen.
  const photoKey = selected
    ? [
        selected.id,
        selected.exterior_image_path,
        selected.orcr_image_path,
        selected.plate_image_path,
        selected.authorization_letter_path,
        selected.owner_id_front_path,
        selected.owner_id_back_path,
        selected.owner_signatures_path,
      ].join('|')
    : null;

  useEffect(() => {
    setImages({});
    if (!selected) return;
    let cancelled = false;
    const sign = (path: string | null) => (path ? getVehiclePhotoUrl(path) : Promise.resolve(null));
    Promise.all([
      sign(selected.exterior_image_path),
      sign(selected.orcr_image_path),
      sign(selected.plate_image_path),
      sign(selected.authorization_letter_path),
      sign(selected.owner_id_front_path),
      sign(selected.owner_id_back_path),
      sign(selected.owner_signatures_path),
    ]).then(([exterior, orcr, plate, authorizationLetter, ownerIdFront, ownerIdBack, ownerSignatures]) => {
      if (!cancelled) setImages({ exterior, orcr, plate, authorizationLetter, ownerIdFront, ownerIdBack, ownerSignatures });
    });
    return () => {
      cancelled = true;
    };
    // photoKey captures every field read from `selected`.
  }, [photoKey]);

  // The license panel reports its photos once it has loaded the new traveler's.
  const selectedUserId = selected?.user_id;
  useEffect(() => setLicensePhotos(undefined), [selectedUserId]);

  // Reviews notify and email the traveler, so they're held for the Undo
  // window: Undo means the decision never reached them.
  const review = (row: VehicleRow, decision: 'approved' | 'rejected', notes: string) => {
    const name = row.profiles?.display_name ?? 'this traveler';
    const car = `${row.make} ${row.model}`.trim();
    const next = neighborId(queueIds, row.id);
    runUndoable({
      key: `vehicle-review:${row.id}`,
      message: decision === 'approved' ? `Approving ${name}'s ${car}…` : `Rejecting ${name}'s ${car}…`,
      description: 'They get a notification and an email once this saves.',
      onHide: () => {
        setStatusPatch((prev) => ({ ...prev, [row.id]: decision }));
        // Move on to the next vehicle so the reviewer never has to hunt for it.
        setSelectedId((current) => (current === row.id ? next : current));
      },
      onRestore: () => setStatusPatch(({ [row.id]: _, ...rest }) => rest),
      commit: () => reviewVehicleVerification(row.id, decision, notes),
      onCommitted: () =>
        void loadQueue(filterStatus, true).then(() => setStatusPatch(({ [row.id]: _, ...rest }) => rest)),
      success: decision === 'approved' ? `${name}'s ${car} approved` : `${name}'s ${car} rejected`,
      error: decision === 'approved' ? 'Failed to approve vehicle' : 'Failed to reject vehicle',
    });
  };

  const handleApprove = (id: string) => {
    const row = vehicles.find((v) => v.id === id);
    if (row) setConfirmApprove(row);
  };

  const handleRejectClick = (id: string) => {
    setSelectedId(id);
    setShowRejectionModal(true);
  };

  const handleRejectSubmit = (reason: string) => {
    const row = vehicles.find((v) => v.id === selectedId);
    if (!row || !reason) return;
    review(row, 'rejected', reason);
  };

  // Selecting from the keyboard can land on another page of the queue.
  const selectVehicle = (id: string) => {
    setSelectedId(id);
    const index = queueIds.indexOf(id);
    if (index >= 0) queuePage.setPage(Math.floor(index / queuePage.pageSize) + 1);
  };
  const selectLicense = (userId: string) => {
    setSelectedLicenseUser(userId);
    const index = licenseIds.indexOf(userId);
    if (index >= 0) licensePage.setPage(Math.floor(index / licensePage.pageSize) + 1);
  };

  const modalsClosed = !showRejectionModal && !lightboxSrc;
  useReviewShortcuts({
    ids: queueIds,
    selectedId,
    onSelect: selectVehicle,
    onApprove: selected?.verification_status === 'pending' ? () => handleApprove(selected.id) : undefined,
    onReject: selected?.verification_status === 'pending' ? () => handleRejectClick(selected.id) : undefined,
    enabled: view === 'vehicles' && modalsClosed,
  });
  useReviewShortcuts({
    ids: licenseIds,
    selectedId: selectedLicenseUser,
    onSelect: selectLicense,
    onApprove: selectedLicense ? () => setLicenseDecision({ license: selectedLicense, decision: 'approved' }) : undefined,
    onReject: selectedLicense ? () => setLicenseDecision({ license: selectedLicense, decision: 'rejected' }) : undefined,
    enabled: view === 'licenses' && modalsClosed,
  });

  const stats = useMemo(() => {
    const pending = vehicles.filter((v) => v.verification_status === 'pending').length;
    const approved = vehicles.filter((v) => v.verification_status === 'approved').length;
    const rejected = vehicles.filter((v) => v.verification_status === 'rejected').length;
    const total = vehicles.length;
    const approvalRate = total ? Math.round((approved / (approved + rejected || 1)) * 100) : 0;
    return { pending, total, approvalRate };
  }, [vehicles]);

  const vehiclePhotos: ViewerPhoto[] = selected
    ? [
        { key: 'exterior', label: 'Vehicle', src: images.exterior },
        { key: 'orcr', label: 'OR/CR', src: images.orcr },
        { key: 'plate', label: 'Plate', src: images.plate },
        ...(selected.ownership_type === 'borrowed'
          ? [
              { key: 'letter', label: 'Authorization', src: images.authorizationLetter },
              { key: 'signatures', label: 'Signatures', src: images.ownerSignatures },
              { key: 'owner-front', label: 'Owner ID front', src: images.ownerIdFront },
              { key: 'owner-back', label: 'Owner ID back', src: images.ownerIdBack },
            ]
          : []),
        ...licenseViewerPhotos(licensePhotos),
      ]
    : [];

  const viewTabs = [
    { value: 'vehicles' as const, label: <><Car className="w-4 h-4" /> Vehicles</> },
    {
      value: 'licenses' as const,
      label: (
        <>
          <IdCard className="w-4 h-4" /> Driver's licenses
          {shownLicenses.length > 0 && (
            <span className="min-w-5 rounded-full bg-orange-500 px-1.5 text-xs font-bold text-white">{shownLicenses.length}</span>
          )}
        </>
      ),
    },
  ];

  return (
    <AdminLayout>
      <ReviewPage
        toolbar={
          <ReviewToolbar title="Vehicle Verification" subtitle="Make sure travelers' vehicles are safe and legitimate for carpooling">
            {view === 'vehicles' ? (
              <>
                <StatChip icon={Clock} label="Pending" value={stats.pending} tone="bg-primary/10 text-primary" />
                <StatChip icon={CheckCircle} label="Approval rate" value={`${stats.approvalRate}%`} tone="bg-green-500/10 text-green-600" />
                <StatChip icon={BarChart3} label="Loaded" value={stats.total} tone="bg-blue-500/10 text-blue-600" />
              </>
            ) : (
              <StatChip icon={IdCard} label="Licenses waiting" value={shownLicenses.length} tone="bg-orange-500/10 text-orange-600" />
            )}
            <Segmented value={view} options={viewTabs} onChange={setView} />
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={view === 'vehicles' ? 'Search name, email, vehicle or plate...' : 'Search by name or email...'}
            />
            {view === 'vehicles' && <Segmented value={filterStatus} options={STATUS_OPTIONS} onChange={setFilterStatus} />}
          </ReviewToolbar>
        }
      >
        {view === 'licenses' ? (
          <>
            <QueuePanel
              title="License-only queue"
              count={licenseMatches.length}
              isLoading={licensesLoading}
              emptyText={term ? 'No licenses match your search' : 'No licenses waiting. A license sent with a vehicle is reviewed with that vehicle.'}
              pagination={licensePage}
              itemLabel="licenses"
            >
              {licensePage.pageItems.map((l) => (
                <QueueItem
                  key={l.user_id}
                  selected={selectedLicenseUser === l.user_id}
                  onSelect={() => setSelectedLicenseUser(l.user_id)}
                  title={l.profiles?.display_name ?? 'Unknown traveler'}
                  subtitle={l.profiles?.email}
                  status="pending"
                  meta={`${l.source === 'id_verification' ? 'Reused from ID' : 'Uploaded'} · ${formatDateTime(l.submitted_at)}`}
                  badges={
                    l.ai_flag && l.ai_flag !== 'passed' ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg whitespace-nowrap bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300">
                        {l.ai_flag === 'mismatch' ? 'Mismatch' : l.ai_flag === 'error' ? 'Unchecked' : 'Needs a look'}
                      </span>
                    ) : undefined
                  }
                />
              ))}
            </QueuePanel>

            {selectedLicense ? (
              <LicenseDetail
                key={selectedLicense.user_id}
                license={selectedLicense}
                onOpenImage={setLightboxSrc}
                onDecide={(decision) => setLicenseDecision({ license: selectedLicense, decision })}
              />
            ) : (
              <EmptyDetail icon={IdCard} text={licensesLoading ? 'Loading the queue…' : 'No licenses waiting'} />
            )}
          </>
        ) : (
          <>
            <QueuePanel
              title="Queue"
              count={queue.length}
              isLoading={isLoading}
              emptyText={term ? 'No vehicles match your search' : 'No vehicles to review'}
              pagination={queuePage}
              itemLabel="vehicles"
            >
              {queuePage.pageItems.map((v) => (
                <QueueItem
                  key={v.id}
                  selected={selectedId === v.id}
                  onSelect={() => setSelectedId(v.id)}
                  title={v.profiles?.display_name ?? 'Unknown traveler'}
                  subtitle={`${v.make} ${v.model}${v.year ? ` (${v.year})` : ''}`}
                  status={v.verification_status}
                  meta={
                    <>
                      {v.plate_number && <span className="font-mono">{v.plate_number}</span>}
                      {v.submitted_at && <span>{formatDateTime(v.submitted_at)}</span>}
                    </>
                  }
                  badges={
                    v.ownership_type === 'borrowed' ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300">Borrowed</span>
                    ) : undefined
                  }
                />
              ))}
            </QueuePanel>

            {selected ? (
              <DetailPanel
                header={
                  <DetailHeading name={selected.profiles?.display_name ?? 'Unknown traveler'} email={selected.profiles?.email}>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        selected.ownership_type === 'borrowed'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300'
                      }`}
                    >
                      {selected.ownership_type === 'borrowed' ? 'Borrowed vehicle' : 'Owned by traveler'}
                    </span>
                    <StatusPill status={selected.verification_status} />
                  </DetailHeading>
                }
                footer={
                  <DecisionBar
                    pending={selected.verification_status === 'pending'}
                    onApprove={() => handleApprove(selected.id)}
                    onReject={() => handleRejectClick(selected.id)}
                    approveLabel="Approve vehicle"
                    closedNote={
                      <>
                        Already <span className="capitalize font-medium text-foreground">{selected.verification_status}</span>
                        {selected.reviewed_at ? ` · ${formatDateTime(selected.reviewed_at)}` : ''}
                      </>
                    }
                  />
                }
              >
                <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
                  <PhotoViewer title="Documents" photos={vehiclePhotos} onOpen={setLightboxSrc} keyboard />

                  <aside className="min-h-0 space-y-3 overflow-y-auto overscroll-contain lg:-mr-1 lg:pr-1">
                    <InfoCard title="Vehicle">
                      <InfoRow label="Make / model">
                        {selected.make} {selected.model}
                      </InfoRow>
                      {selected.year && <InfoRow label="Year">{selected.year}</InfoRow>}
                      {selected.color && <InfoRow label="Color">{selected.color}</InfoRow>}
                      {selected.plate_number && (
                        <InfoRow label="Plate">
                          <span className="font-mono">{selected.plate_number}</span>
                        </InfoRow>
                      )}
                      {selected.vehicle_type && (
                        <InfoRow label="Type">
                          <span className="capitalize">{selected.vehicle_type === 'suv' || selected.vehicle_type === 'mpv' ? selected.vehicle_type.toUpperCase() : selected.vehicle_type}</span>
                          {selected.seat_capacity ? ` · ${selected.seat_capacity} seats` : ''}
                        </InfoRow>
                      )}
                      {selected.registration_expiry && (
                        <InfoRow label="Registration until">
                          <span className={selected.registration_expiry < new Date().toISOString().slice(0, 10) ? 'text-red-600 dark:text-red-400' : ''}>
                            {new Date(`${selected.registration_expiry}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="block text-xs font-normal text-muted-foreground">Check it matches the OR/CR</span>
                        </InfoRow>
                      )}
                      <InfoRow label="Submitted">{selected.submitted_at ? formatDateTime(selected.submitted_at) : 'Unknown'}</InfoRow>
                      {selected.reviewer_notes && <InfoRow label="Notes">{selected.reviewer_notes}</InfoRow>}
                    </InfoCard>
                    <div className="rounded-xl border border-border p-3">
                      <DriverLicensePanel
                        key={selected.user_id}
                        userId={selected.user_id}
                        onOpenImage={setLightboxSrc}
                        hidePhotos
                        onPhotos={setLicensePhotos}
                      />
                    </div>
                  </aside>
                </div>
              </DetailPanel>
            ) : (
              <EmptyDetail icon={Car} text={isLoading ? 'Loading the queue…' : 'Nothing to review here'} />
            )}
          </>
        )}
      </ReviewPage>

      <ConfirmActionDialog
        open={showRejectionModal}
        onOpenChange={setShowRejectionModal}
        tone="destructive"
        title="Reject this vehicle?"
        description="The owner gets a notification and an email with your reason, and can submit it again."
        notes={{ label: 'Reason', required: true, placeholder: 'Add details (optional)', presets: REASON_PRESETS.vehicleReject, audience: 'The owner' }}
        confirmLabel="Reject vehicle"
        onConfirm={handleRejectSubmit}
      />

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      <ConfirmActionDialog
        open={licenseDecision !== null}
        onOpenChange={(open) => !open && setLicenseDecision(null)}
        tone={licenseDecision?.decision === 'rejected' ? 'destructive' : 'default'}
        title={
          licenseDecision?.decision === 'rejected'
            ? `Reject ${licenseDecision.license.profiles?.display_name ?? 'this traveler'}'s driver's license?`
            : `Approve ${licenseDecision?.license.profiles?.display_name ?? 'this traveler'}'s driver's license?`
        }
        description={
          licenseDecision?.decision === 'rejected'
            ? "They're notified with your reason and can submit a new license."
            : 'Check the photos, name, expiry and QR result. Once approved they can create carpools, and they get a notification.'
        }
        notes={
          licenseDecision?.decision === 'rejected'
            ? { label: 'Reason', required: true, placeholder: 'Add details (optional)', presets: REASON_PRESETS.licenseReject, audience: 'The traveler' }
            : undefined
        }
        confirmLabel={licenseDecision?.decision === 'rejected' ? 'Reject license' : 'Approve license'}
        onConfirm={(notes) => {
          if (!licenseDecision) return;
          const { license, decision } = licenseDecision;
          decideLicense(license, decision, decision === 'approved' ? 'Approved by an admin after manual review.' : notes.trim());
          setLicenseDecision(null);
        }}
      />
      <ConfirmActionDialog
        open={confirmApprove !== null}
        onOpenChange={(open) => !open && setConfirmApprove(null)}
        title={`Approve ${confirmApprove ? `${confirmApprove.make} ${confirmApprove.model}` : 'this vehicle'}?`}
        description="Check that the plate, OR/CR and photos match (and the owner's documents for a borrowed car). Their pending driver's license is approved too, and they're notified and emailed."
        confirmLabel="Approve vehicle"
        onConfirm={() => {
          if (confirmApprove) review(confirmApprove, 'approved', 'Approved by an admin after manual review.');
        }}
      />
    </AdminLayout>
  );
}

function LicenseDetail({
  license,
  onOpenImage,
  onDecide,
}: {
  license: DriverLicense;
  onOpenImage: (src: string) => void;
  onDecide: (decision: 'approved' | 'rejected') => void;
}) {
  const [photos, setPhotos] = useState<LicensePhotos | undefined>(undefined);
  return (
    <DetailPanel
      header={
        <DetailHeading name={license.profiles?.display_name ?? 'Unknown traveler'} email={license.profiles?.email}>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-foreground">
            {license.source === 'id_verification' ? 'Reused from verified ID' : 'Uploaded'}
          </span>
          <StatusPill status={license.status} />
        </DetailHeading>
      }
      footer={<DecisionBar pending onApprove={() => onDecide('approved')} onReject={() => onDecide('rejected')} approveLabel="Approve license" />}
    >
      <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <PhotoViewer title="Driver's license" photos={licenseViewerPhotos(photos)} onOpen={onOpenImage} keyboard />
        <aside className="min-h-0 overflow-y-auto overscroll-contain rounded-xl border border-border p-3">
          <DriverLicensePanel license={license} onOpenImage={onOpenImage} hidePhotos onPhotos={setPhotos} />
        </aside>
      </div>
    </DetailPanel>
  );
}
