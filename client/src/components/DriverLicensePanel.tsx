import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, CircleHelp, IdCard, QrCode, XCircle } from 'lucide-react';
import { getDriverLicenseFor, getDriverLicensePhotoUrl, type DriverLicense, type LicenseAiFlag } from '@/lib/vehicles';
import { formatDateTime } from '@/lib/datetime';

// A traveler's driver's license as an admin reviews it: both photos, the
// automatic check (verify-vehicle-ai in partyup-mobile) and the QR result.
// Shown with every vehicle review (approving the vehicle also approves a
// pending license) and on its own in the license-only queue.

const FLAG_STYLE: Record<LicenseAiFlag, { label: string; className: string }> = {
  passed: { label: 'Auto-check passed', className: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' },
  needs_review: { label: 'Needs a look', className: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300' },
  mismatch: { label: 'Mismatch', className: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300' },
  error: { label: "Auto-check couldn't run", className: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300' },
};

function CheckRow({ label, ok, detail }: { label: string; ok: boolean | null; detail: string }) {
  const Icon = ok === null ? CircleHelp : ok ? CheckCircle2 : XCircle;
  const tone = ok === null ? 'text-muted-foreground' : ok ? 'text-green-600 dark:text-green-400' : 'text-destructive';
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${tone}`} />
      <span className="text-muted-foreground w-28 shrink-0">{label}</span>
      <span className={`font-medium ${ok === false ? 'text-destructive' : 'text-foreground'}`}>{detail}</span>
    </div>
  );
}

function Photo({ label, src, onOpen }: { label: string; src: string | null | undefined; onOpen: (src: string) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">{label}</p>
      <div className="bg-secondary rounded-lg overflow-hidden h-40 flex items-center justify-center border border-border">
        {src ? (
          <img src={src} alt={`License ${label.toLowerCase()}`} className="h-full w-full object-contain cursor-zoom-in" onClick={() => onOpen(src)} />
        ) : (
          <p className="text-sm text-muted-foreground">{src === null ? 'No photo' : 'Loading...'}</p>
        )}
      </div>
    </div>
  );
}

interface Props {
  /** Pass the license if already loaded; otherwise it's fetched for `userId`. */
  license?: DriverLicense | null;
  userId?: string;
  onOpenImage: (src: string) => void;
  /** Leave the photos out (the review screen shows them in its own viewer). */
  hidePhotos?: boolean;
  /** Signed photo URLs as they load (undefined = loading), or null when there's no license. */
  onPhotos?: (photos: { front?: string | null; back?: string | null } | null) => void;
}

export default function DriverLicensePanel({ license: given, userId, onOpenImage, hidePhotos = false, onPhotos }: Props) {
  const [fetched, setFetched] = useState<DriverLicense | null | undefined>(undefined);
  const [photos, setPhotos] = useState<{ front?: string | null; back?: string | null }>({});
  const [showQr, setShowQr] = useState(false);
  const license = given !== undefined ? given : fetched;

  useEffect(() => {
    if (given !== undefined || !userId) return;
    let cancelled = false;
    setFetched(undefined);
    void getDriverLicenseFor(userId).then(({ data }) => !cancelled && setFetched(data));
    return () => {
      cancelled = true;
    };
  }, [given, userId]);

  const photoKey = license ? `${license.user_id}|${license.source}|${license.front_image_path}|${license.back_image_path}` : '';
  useEffect(() => {
    setPhotos({});
    setShowQr(false);
    if (!license) return;
    let cancelled = false;
    void Promise.all([
      getDriverLicensePhotoUrl(license, license.front_image_path),
      getDriverLicensePhotoUrl(license, license.back_image_path),
    ]).then(([front, back]) => !cancelled && setPhotos({ front, back }));
    return () => {
      cancelled = true;
    };
    // photoKey captures every field read from `license`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoKey]);

  const onPhotosRef = useRef(onPhotos);
  onPhotosRef.current = onPhotos;
  useEffect(() => {
    if (license === undefined) return;
    onPhotosRef.current?.(license ? { front: photos.front, back: license.back_image_path ? photos.back : null } : null);
  }, [license, photos]);

  if (license === undefined) return <p className="text-sm text-muted-foreground">Loading driver's license…</p>;
  if (license === null) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        No driver's license on file. Reject and ask them to add one.
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const expired = !!license.expiry_date && license.expiry_date < today;
  const flag = license.ai_flag ? FLAG_STYLE[license.ai_flag] : null;
  const qrDetail =
    license.ai_qr_match === null
      ? license.qr_data
        ? license.ai_checked_at
          ? "Couldn't compare (card unreadable)"
          : 'Not checked yet'
        : 'Not scanned'
      : license.ai_qr_match
        ? 'Matches the card (number, name, expiry)'
        : "Doesn't match the card";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <IdCard className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-bold text-foreground">Driver's license</h4>
        <span className="text-xs text-muted-foreground">
          {license.source === 'id_verification' ? 'Reused from verified ID' : 'Uploaded'} · <span className="capitalize">{license.status}</span>
        </span>
        {flag && <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${flag.className}`}>{flag.label}</span>}
      </div>

      {!hidePhotos && (
      <div className="grid grid-cols-2 gap-4">
        <Photo label="Front" src={photos.front} onOpen={onOpenImage} />
        <Photo label="Back" src={license.back_image_path ? photos.back : null} onOpen={onOpenImage} />
      </div>
      )}

      <div className="rounded-lg border border-border bg-secondary p-3 space-y-1.5">
        <CheckRow label="Name" ok={license.ai_name_match} detail={license.ai_name_match === null ? 'Unreadable' : license.ai_name_match ? 'Matches the traveler' : "Doesn't match the traveler"} />
        <CheckRow label="QR code" ok={license.ai_qr_match} detail={qrDetail} />
        <CheckRow
          label="Expiry"
          ok={license.expiry_date ? !expired : null}
          detail={license.expiry_date ? `${license.expiry_date}${expired ? ' (expired)' : ''}` : 'Unreadable'}
        />
        <CheckRow label="Codes" ok={null} detail={license.restriction_codes.length ? license.restriction_codes.join(', ') : 'Unreadable'} />
        {license.license_number && <CheckRow label="License no." ok={null} detail={license.license_number} />}
        {license.ai_error && <p className="pt-1 text-sm font-medium text-destructive">{license.ai_error}</p>}
        <p className="pt-1 text-xs text-muted-foreground">
          Submitted {formatDateTime(license.submitted_at)}
          {license.ai_checked_at ? ` · checked ${formatDateTime(license.ai_checked_at)}` : ''}
        </p>
        {license.reviewer_notes && <p className="text-xs text-muted-foreground">Note: {license.reviewer_notes}</p>}
      </div>

      {license.qr_data && (
        <div>
          <button
            type="button"
            onClick={() => setShowQr((on) => !on)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <QrCode className="w-3.5 h-3.5" />
            {showQr ? 'Hide raw QR' : 'Show raw QR'}
          </button>
          {showQr && (
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-border bg-secondary p-3 text-xs text-foreground">
              {license.qr_data}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
