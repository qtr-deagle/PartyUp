import { useEffect, useState, useCallback, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, BarChart3 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { ImageLightbox } from '@/components/ImageLightbox';
import { listVehicles, getVehiclePhotoUrl, reviewVehicleVerification, type VehicleRow, type VehicleVerificationStatus } from '@/lib/vehicles';
import { useTableRealtime } from '@/hooks/useTableRealtime';

/**
 * Staff Vehicles - Personal Vehicle Verification
 *
 * Staff can:
 * - Review travelers' personal vehicles submitted for verification
 * - Inspect the exterior, OR/CR, and plate photos
 * - For borrowed vehicles, also inspect the owner's letter of authorization,
 *   both sides of the owner's ID, and the owner's 3 specimen signatures
 * - Approve or reject with a note back to the traveler
 * - Browse past decisions by status (all / pending / approved / rejected)
 */
// 'unverified' vehicles were never submitted, so they never show up here.
type FilterStatus = 'all' | Exclude<VehicleVerificationStatus, 'unverified'>;

type VehicleImages = {
  exterior: string | null;
  orcr: string | null;
  plate: string | null;
  authorizationLetter: string | null;
  ownerIdFront: string | null;
  ownerIdBack: string | null;
  ownerSignatures: string | null;
};

const EMPTY_IMAGES: VehicleImages = {
  exterior: null,
  orcr: null,
  plate: null,
  authorizationLetter: null,
  ownerIdFront: null,
  ownerIdBack: null,
  ownerSignatures: null,
};

function DocumentImage({ label, src, alt, onOpen }: { label: string; src: string | null; alt: string; onOpen: (src: string) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">{label}</p>
      <div className="bg-secondary rounded-lg overflow-hidden h-40 flex items-center justify-center border border-border">
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-contain cursor-zoom-in" onClick={() => onOpen(src)} />
        ) : (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}
      </div>
    </div>
  );
}

export default function StaffVehicles() {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [images, setImages] = useState<VehicleImages>(EMPTY_IMAGES);
  const [rejectionReason, setRejectionReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');

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

  const selected = vehicles.find((v) => v.id === selectedId) ?? null;
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
    if (!selected) {
      setImages(EMPTY_IMAGES);
      return;
    }
    let cancelled = false;
    Promise.all([
      getVehiclePhotoUrl(selected.exterior_image_path),
      getVehiclePhotoUrl(selected.orcr_image_path),
      getVehiclePhotoUrl(selected.plate_image_path),
      getVehiclePhotoUrl(selected.authorization_letter_path),
      getVehiclePhotoUrl(selected.owner_id_front_path),
      getVehiclePhotoUrl(selected.owner_id_back_path),
      getVehiclePhotoUrl(selected.owner_signatures_path),
    ]).then(([exterior, orcr, plate, authorizationLetter, ownerIdFront, ownerIdBack, ownerSignatures]) => {
      if (!cancelled) setImages({ exterior, orcr, plate, authorizationLetter, ownerIdFront, ownerIdBack, ownerSignatures });
    });
    return () => {
      cancelled = true;
    };
    // photoKey captures every field read from `selected`.
  }, [photoKey]);

  const handleApprove = async (id: string) => {
    setIsSubmitting(true);
    const { error } = await reviewVehicleVerification(id, 'approved', 'Approved by a Guild Leader after manual review.');
    setIsSubmitting(false);
    if (!error) {
      setSelectedId(null);
      await loadQueue(filterStatus);
    }
  };

  const handleRejectClick = (id: string) => {
    setSelectedId(id);
    setShowRejectionModal(true);
  };

  // Picking "Other" requires typing the reason; that text is what gets saved.
  const finalRejectionReason = rejectionReason === 'Other' ? otherReason.trim() : rejectionReason;

  const handleRejectSubmit = async () => {
    if (!selectedId || !finalRejectionReason) return;
    setIsSubmitting(true);
    const { error } = await reviewVehicleVerification(selectedId, 'rejected', finalRejectionReason);
    setIsSubmitting(false);
    if (!error) {
      setShowRejectionModal(false);
      setRejectionReason('');
      setOtherReason('');
      setSelectedId(null);
      await loadQueue(filterStatus);
    }
  };

  const stats = useMemo(() => {
    const pending = vehicles.filter((v) => v.verification_status === 'pending').length;
    const approved = vehicles.filter((v) => v.verification_status === 'approved').length;
    const rejected = vehicles.filter((v) => v.verification_status === 'rejected').length;
    const total = vehicles.length;
    const approvalRate = total ? Math.round((approved / (approved + rejected || 1)) * 100) : 0;
    return { pending, total, approvalRate };
  }, [vehicles]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vehicle Verification</h1>
          <p className="text-sm text-muted-foreground mt-2">Review and approve travelers' personal vehicles for carpooling</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-1">Pending Verifications</p>
            <p className="text-3xl font-bold text-foreground">{stats.pending}</p>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/10 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-1">Approval Rate (loaded set)</p>
            <p className="text-3xl font-bold text-foreground">{stats.approvalRate}%</p>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-1">Total Loaded</p>
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-elevation-2 border border-border">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === status ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold text-foreground mb-4">Queue ({vehicles.length})</h2>
            <div className="bg-card rounded-2xl p-4 shadow-elevation-2 border border-border">
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {vehicles.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No vehicles to review</p>}
                  {vehicles.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedId(v.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                        selectedId === v.id ? 'bg-primary/10 border-primary' : 'bg-secondary border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-foreground">{v.profiles?.display_name ?? 'Unknown traveler'}</p>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap capitalize ${
                            v.verification_status === 'approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300'
                              : v.verification_status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'
                          }`}
                        >
                          {v.verification_status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{v.profiles?.email}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {v.make} {v.model} {v.year ? `(${v.year})` : ''}
                      </p>
                      {v.plate_number && <p className="text-xs text-muted-foreground mt-1">Plate: {v.plate_number}</p>}
                      {v.ownership_type === 'borrowed' && (
                        <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300">Borrowed</span>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {v.submitted_at ? new Date(v.submitted_at).toLocaleString() : ''}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selected ? (
            <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selected.profiles?.display_name ?? 'Unknown traveler'}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selected.profiles?.email}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {selected.make} {selected.model} {selected.year ? `(${selected.year})` : ''}
                    {selected.color ? ` • ${selected.color}` : ''}
                  </p>
                  {selected.plate_number && <p className="text-xs text-muted-foreground mt-1">Plate: {selected.plate_number}</p>}
                  <span
                    className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      selected.ownership_type === 'borrowed' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' : 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300'
                    }`}
                  >
                    {selected.ownership_type === 'borrowed' ? 'Borrowed vehicle' : 'Owned by traveler'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <DocumentImage label="Vehicle" src={images.exterior} alt="Vehicle exterior" onOpen={setLightboxSrc} />
                  <DocumentImage label="OR/CR" src={images.orcr} alt="OR/CR document" onOpen={setLightboxSrc} />
                  <DocumentImage label="Plate" src={images.plate} alt="License plate" onOpen={setLightboxSrc} />
                </div>

                {selected.ownership_type === 'borrowed' && (
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-3">Owner's Authorization</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <DocumentImage label="Letter of Authorization" src={images.authorizationLetter} alt="Letter of authorization" onOpen={setLightboxSrc} />
                      <DocumentImage label="Owner's 3 Signatures" src={images.ownerSignatures} alt="Owner specimen signatures" onOpen={setLightboxSrc} />
                      <DocumentImage label="Owner ID (Front)" src={images.ownerIdFront} alt="Owner ID front" onOpen={setLightboxSrc} />
                      <DocumentImage label="Owner ID (Back)" src={images.ownerIdBack} alt="Owner ID back" onOpen={setLightboxSrc} />
                    </div>
                  </div>
                )}

                <div className="bg-secondary rounded-lg p-3 space-y-2 border border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Submitted:</span>
                    <span className="font-medium text-foreground">
                      {selected.submitted_at ? new Date(selected.submitted_at).toLocaleString() : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-foreground capitalize">{selected.verification_status}</span>
                  </div>
                  {selected.reviewed_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reviewed:</span>
                      <span className="font-medium text-foreground">{new Date(selected.reviewed_at).toLocaleString()}</span>
                    </div>
                  )}
                  {selected.reviewer_notes && (
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-muted-foreground shrink-0">Reviewer notes:</span>
                      <span className="font-medium text-foreground text-right">{selected.reviewer_notes}</span>
                    </div>
                  )}
                </div>

                {selected.verification_status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <button
                      onClick={() => handleApprove(selected.id)}
                      disabled={isSubmitting}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold transition-smooth hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectClick(selected.id)}
                      disabled={isSubmitting}
                      className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold transition-smooth hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 bg-card rounded-2xl p-12 shadow-elevation-2 border border-border flex items-center justify-center">
              <div className="text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Select a vehicle to review</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <strong>Verification Purpose:</strong> Ensure travelers' personal vehicles are safe and legitimate for carpooling. Check vehicle condition, ownership, and safety compliance.
          </p>
        </div>
      </div>

      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full shadow-elevation-3 border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Reject Verification</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Reason for Rejection</label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                >
                  <option value="">Select a reason...</option>
                  <option value="Poor image quality">Poor image quality</option>
                  <option value="Photos do not match vehicle details">Photos do not match vehicle details</option>
                  <option value="Plate or OR/CR unreadable">Plate or OR/CR unreadable</option>
                  <option value="Vehicle or documents look suspicious">Vehicle or documents look suspicious</option>
                  <option value="Owner authorization incomplete or invalid">Owner authorization incomplete or invalid</option>
                  <option value="Other">Other</option>
                </select>
                {rejectionReason === 'Other' && (
                  <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Describe the reason (the user will see this)"
                    rows={3}
                    autoFocus
                    className="mt-3 w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none"
                  />
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="flex-1 border border-border text-foreground py-2.5 rounded-lg hover:bg-secondary font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={!finalRejectionReason || isSubmitting}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </AdminLayout>
  );
}
