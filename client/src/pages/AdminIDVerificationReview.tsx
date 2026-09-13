import { useEffect, useState, useCallback, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, BarChart3 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { ImageLightbox } from '@/components/ImageLightbox';
import { listIdVerifications, getSignedImageUrl, reviewIdVerification, type IdVerificationRow, type VerificationStatus, type AiFlag } from '@/lib/verification';

type FilterStatus = 'all' | VerificationStatus;

const AI_FLAG_STYLES: Record<AiFlag, string> = {
  high_confidence: 'bg-green-100 text-green-700',
  needs_review: 'bg-yellow-100 text-yellow-700',
  low_similarity: 'bg-red-100 text-red-700',
  error: 'bg-gray-200 text-gray-600',
};

function AiSimilarityBadge({ score, flag }: { score: number | null; flag: AiFlag | null }) {
  if (!flag) {
    return <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500 whitespace-nowrap">AI: pending</span>;
  }
  const label = flag === 'error' ? 'AI: error' : `AI match: ${Math.round(score ?? 0)}%`;
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-lg whitespace-nowrap ${AI_FLAG_STYLES[flag]}`}>{label}</span>;
}

export default function AdminIDVerificationReview() {
  const [verifications, setVerifications] = useState<IdVerificationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [images, setImages] = useState<{ front: string | null; back: string | null; selfie: string | null }>({ front: null, back: null, selfie: null });
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const loadQueue = useCallback(async (status: FilterStatus) => {
    setIsLoading(true);
    const { data } = await listIdVerifications(status === 'all' ? undefined : status);
    setVerifications(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadQueue(filterStatus);
    setSelectedId(null);
  }, [filterStatus, loadQueue]);

  const selected = verifications.find((v) => v.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected) {
      setImages({ front: null, back: null, selfie: null });
      return;
    }
    let cancelled = false;
    Promise.all([
      getSignedImageUrl(selected.front_image_path),
      getSignedImageUrl(selected.back_image_path),
      getSignedImageUrl(selected.selfie_image_path),
    ]).then(([front, back, selfie]) => {
      if (!cancelled) setImages({ front, back, selfie });
    });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const handleApprove = async (id: string) => {
    setIsSubmitting(true);
    const { error } = await reviewIdVerification(id, 'approved', 'Approved by admin after manual review.');
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

  const handleRejectSubmit = async () => {
    if (!selectedId || !rejectionReason) return;
    setIsSubmitting(true);
    const { error } = await reviewIdVerification(selectedId, 'rejected', rejectionReason);
    setIsSubmitting(false);
    if (!error) {
      setShowRejectionModal(false);
      setRejectionReason('');
      setSelectedId(null);
      await loadQueue(filterStatus);
    }
  };

  const stats = useMemo(() => {
    const pending = verifications.filter((v) => v.status === 'pending').length;
    const approved = verifications.filter((v) => v.status === 'approved').length;
    const rejected = verifications.filter((v) => v.status === 'rejected').length;
    const total = verifications.length;
    const approvalRate = total ? Math.round((approved / (approved + rejected || 1)) * 100) : 0;
    return { pending, total, approvalRate };
  }, [verifications]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ID Verification Management</h1>
          <p className="text-sm text-muted-foreground mt-2">Monitor and manage user identity verification submissions</p>
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
            <h2 className="text-lg font-bold text-foreground mb-4">Queue ({verifications.length})</h2>
            <div className="bg-card rounded-2xl p-4 shadow-elevation-2 border border-border">
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {verifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No verifications to review</p>
                  ) : (
                    verifications.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedId(v.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                          selectedId === v.id ? 'bg-primary/10 border-primary' : 'bg-secondary border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{v.profiles?.display_name ?? 'Unknown user'}</p>
                            <p className="text-xs text-muted-foreground mt-1">{v.profiles?.email}</p>
                            <p className="text-xs text-muted-foreground mt-2">{new Date(v.submitted_at).toLocaleString()}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 ml-2">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap capitalize ${
                                v.status === 'approved'
                                  ? 'bg-green-100 text-green-700'
                                  : v.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {v.status}
                            </span>
                            <AiSimilarityBadge score={v.ai_similarity_score} flag={v.ai_flag} />
                            {v.ai_underage_flag && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-orange-100 text-orange-700 whitespace-nowrap">Age flag</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {selected ? (
            <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selected.profiles?.display_name ?? 'Unknown user'}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selected.profiles?.email}</p>
                  <p className="text-xs text-muted-foreground mt-2">Document: {selected.document_type.replace('_', ' ')}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Front of ID</p>
                    <div className="bg-secondary rounded-lg overflow-hidden h-56 flex items-center justify-center border border-border">
                      {images.front ? (
                        <img
                          src={images.front}
                          alt="ID front"
                          className="h-full w-full object-contain cursor-zoom-in"
                          onClick={() => setLightboxSrc(images.front)}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Selfie</p>
                    <div className="bg-secondary rounded-lg overflow-hidden h-56 flex items-center justify-center border border-border">
                      {images.selfie ? (
                        <img
                          src={images.selfie}
                          alt="Selfie"
                          className="h-full w-full object-contain cursor-zoom-in"
                          onClick={() => setLightboxSrc(images.selfie)}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                      )}
                    </div>
                  </div>
                  {selected.back_image_path && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Back of ID</p>
                      <div className="bg-secondary rounded-lg overflow-hidden h-56 flex items-center justify-center border border-border">
                        {images.back ? (
                          <img
                            src={images.back}
                            alt="ID back"
                            className="h-full w-full object-contain cursor-zoom-in"
                            onClick={() => setLightboxSrc(images.back)}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">Loading...</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-secondary rounded-lg p-3 space-y-2 border border-border">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">AI facial similarity match:</span>
                    <AiSimilarityBadge score={selected.ai_similarity_score} flag={selected.ai_flag} />
                  </div>
                  {selected.ai_age_low !== null && selected.ai_age_high !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">AI estimated age range:</span>
                      <span className={`font-medium ${selected.ai_underage_flag ? 'text-orange-600' : 'text-foreground'}`}>
                        {selected.ai_age_low}-{selected.ai_age_high}
                        {selected.ai_underage_flag ? ' (below 18 -- verify carefully)' : ''}
                      </span>
                    </div>
                  )}
                  {selected.ai_error && (
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-muted-foreground shrink-0">AI note:</span>
                      <span className="font-medium text-foreground text-right">{selected.ai_error}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground italic pt-1 border-t border-border">
                    AI results are advisory only -- always confirm against the photos before deciding.
                  </p>
                </div>

                <div className="bg-secondary rounded-lg p-3 space-y-2 border border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Submitted:</span>
                    <span className="font-medium text-foreground">{new Date(selected.submitted_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-foreground capitalize">{selected.status}</span>
                  </div>
                  {selected.reviewer_notes && (
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-muted-foreground shrink-0">Reviewer notes:</span>
                      <span className="font-medium text-foreground text-right">{selected.reviewer_notes}</span>
                    </div>
                  )}
                </div>

                {selected.status === 'pending' && (
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
                <p className="text-muted-foreground">Select a verification to review</p>
              </div>
            </div>
          )}
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
                  <option value="Face does not match ID">Face does not match ID</option>
                  <option value="Invalid or expired ID">Invalid or expired ID</option>
                  <option value="Face or ID obscured">Face or ID obscured</option>
                  <option value="Other">Other</option>
                </select>
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
                  disabled={!rejectionReason || isSubmitting}
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
