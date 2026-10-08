import { useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

// The one confirmation dialog for admin actions. Optional extras make the
// admin slow down for risky ones: a checkbox they must tick, notes they
// must write, or a word they must type back.

export interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  /** Extra content between the description and the inputs. */
  children?: ReactNode;
  tone?: 'default' | 'destructive';
  confirmLabel?: string;
  cancelLabel?: string;
  checkbox?: { label: string };
  notes?: { label: string; required?: boolean; placeholder?: string; initial?: string };
  /** The admin must type this exact text to enable the confirm button. */
  typeToConfirm?: string;
  /** Keeps the confirm button disabled, e.g. while a precondition is loading or unmet. */
  confirmDisabled?: boolean;
  /**
   * Runs on confirm with the typed notes. If it returns a promise the dialog
   * stays open (busy) until it settles; return false to keep it open.
   */
  onConfirm: (notes: string) => void | boolean | Promise<void | boolean>;
}

export default function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  tone = 'default',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  checkbox,
  notes,
  typeToConfirm,
  confirmDisabled = false,
  onConfirm,
}: ConfirmActionDialogProps) {
  const [checked, setChecked] = useState(false);
  const [noteText, setNoteText] = useState(notes?.initial ?? '');
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);

  // Fresh inputs every time the dialog opens.
  useEffect(() => {
    if (open) {
      setChecked(false);
      setNoteText(notes?.initial ?? '');
      setTyped('');
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const destructive = tone === 'destructive';
  const ready =
    !busy &&
    !confirmDisabled &&
    (!checkbox || checked) &&
    (!notes?.required || noteText.trim().length > 0) &&
    (!typeToConfirm || typed.trim() === typeToConfirm.trim());

  const handleConfirm = async () => {
    if (!ready) return;
    setBusy(true);
    try {
      const result = await onConfirm(noteText.trim());
      if (result !== false) onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <AlertDialogContent className={cn(destructive && 'border-red-500/40')}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {destructive && (
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <AlertTriangle className="h-4 w-4" />
              </span>
            )}
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription asChild>
              <div className="text-sm text-muted-foreground">{description}</div>
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {children}

        {notes && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              {notes.label}
              {notes.required && <span className="text-red-500"> *</span>}
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={notes.placeholder}
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        )}

        {typeToConfirm && (
          <div className="space-y-1.5">
            <label className="text-sm">
              Type <span className="font-semibold">{typeToConfirm}</span> to confirm
            </label>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              autoComplete="off"
            />
          </div>
        )}

        {checkbox && (
          <label
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm',
              destructive ? 'border-red-500/30 bg-red-500/5' : 'border-border',
            )}
          >
            <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} className="mt-0.5" />
            <span>{checkbox.label}</span>
          </label>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            disabled={!ready}
            className={cn(destructive && 'bg-destructive text-white hover:bg-destructive/90')}
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
          >
            {busy ? 'Working…' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
