import { Loader2 } from 'lucide-react';
import { isAiRunning } from '@/hooks/useAiResultPoll';

// Placeholder while the AI pre-check hasn't written its result yet: a spinner
// while it can still land, then a static "not run" so old rows don't spin forever.
export default function AiCheckingBadge({ submittedAt, label }: { submittedAt: string; label: string }) {
  if (isAiRunning(submittedAt)) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg bg-primary/10 text-primary whitespace-nowrap">
        <Loader2 className="w-3 h-3 animate-spin" />
        {label} checking...
      </span>
    );
  }
  return <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-gray-500/15 text-muted-foreground whitespace-nowrap">{label}: not run</span>;
}
