import { NotebookPen } from 'lucide-react';
import { timeAgo } from '@/lib/datetime';

// "Continue your draft?" card at the top of a form with a saved, unsent
// draft (see useDraft in lib/unsavedChanges.ts).
export default function DraftBanner({
  savedAt,
  preview,
  onContinue,
  onStartFresh,
}: {
  savedAt: string;
  preview?: string | null;
  onContinue: () => void;
  onStartFresh: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-1 items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card text-primary shadow-sm">
          <NotebookPen className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-foreground">Continue your draft?</p>
          <p className="truncate text-sm text-muted-foreground">
            {preview ? `“${preview}” · ` : ''}saved {timeAgo(savedAt)}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onStartFresh}
          className="h-9 flex-1 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-secondary sm:flex-none"
        >
          Start fresh
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="h-9 flex-1 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:flex-none"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
