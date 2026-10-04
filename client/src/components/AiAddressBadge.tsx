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
