import { AlertTriangle, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import AiCheckingBadge from '@/components/AiCheckingBadge';
import type { AiAddressFlag } from '@/lib/verification';

const STYLES: Record<AiAddressFlag, string> = {
  match: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
  other_bulacan_town: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  bulacan_unknown_town: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  not_bulacan: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
  not_found: 'bg-gray-500/15 text-muted-foreground',
  not_applicable: 'bg-gray-500/15 text-muted-foreground',
  error: 'bg-gray-500/15 text-muted-foreground',
};

// Advisory OCR read of the ID address vs the municipality the user declared.
export default function AiAddressBadge({
  flag,
  detected,
  declared,
  submittedAt,
}: {
  flag: AiAddressFlag | null;
  detected: string | null;
  declared: string | null;
  submittedAt: string;
}) {
  if (!flag) {
    return <AiCheckingBadge submittedAt={submittedAt} label="Address" />;
  }
  const labels: Record<AiAddressFlag, string> = {
    match: `Address: ${detected}, Bulacan (matches)`,
    other_bulacan_town: `ID says ${detected}, declared ${declared ?? 'none'}`,
    bulacan_unknown_town: `Bulacan, town unclear (declared ${declared ?? 'none'})`,
    not_bulacan: 'No Bulacan address found',
    not_found: 'Address unreadable',
    not_applicable: 'Passport, no address',
    error: 'Address check failed',
  };
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${STYLES[flag]}`}>{labels[flag]}</span>;
}

// Short verdict for the pill; the towns go on the line underneath.
const VERDICT: Record<AiAddressFlag, { label: string; icon: typeof CheckCircle2 }> = {
  match: { label: 'Matches', icon: CheckCircle2 },
  other_bulacan_town: { label: 'Different town', icon: AlertTriangle },
  bulacan_unknown_town: { label: 'Town unclear', icon: HelpCircle },
  not_bulacan: { label: 'Not Bulacan', icon: XCircle },
  not_found: { label: 'Unreadable', icon: HelpCircle },
  not_applicable: { label: 'No address', icon: HelpCircle },
  error: { label: 'Check failed', icon: HelpCircle },
};

// Two-line version for narrow side panels: label + short pill on top, the
// detected vs declared town below in small text.
export function AiAddressCheck({
  flag,
  detected,
  declared,
  submittedAt,
  label = 'Bulacan address',
}: {
  flag: AiAddressFlag | null;
  detected: string | null;
  declared: string | null;
  submittedAt: string;
  label?: string;
}) {
  const verdict = flag ? VERDICT[flag] : null;
  const Icon = verdict?.icon;
  const detail =
    flag === 'not_applicable'
      ? 'Passports have no address to check'
      : flag && flag !== 'error' && flag !== 'not_found'
        ? `ID: ${flag === 'bulacan_unknown_town' ? 'Bulacan (town unclear)' : flag === 'not_bulacan' ? 'outside Bulacan' : detected ?? 'unknown'} · Declared: ${declared ?? 'none'}`
        : null;

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground">{label}</span>
        {flag && verdict && Icon ? (
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg whitespace-nowrap ${STYLES[flag]}`}>
            <Icon className="w-3.5 h-3.5" />
            {verdict.label}
          </span>
        ) : (
          <AiCheckingBadge submittedAt={submittedAt} label="Address" />
        )}
      </div>
      {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}
