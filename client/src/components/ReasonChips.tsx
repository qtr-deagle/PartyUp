import { useEffect, useRef, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { composeReason, type ReasonPreset, type ReasonValue } from '@/lib/reasonPresets';
import { cn } from '@/lib/utils';

// Multi-select quick reasons plus an optional details box. Number keys 1-9
// toggle chips (ignored while typing). The preview shows the exact message
// the composed reason becomes. Only one should be mounted at a time.

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && !!target.closest('input, textarea, select, [contenteditable="true"]');
}

export default function ReasonChips({
  presets,
  value,
  onChange,
  label = 'Quick reasons',
  required = false,
  audience,
  detailsPlaceholder = 'Add details (optional)',
}: {
  presets: ReasonPreset[];
  value: ReasonValue;
  onChange: (next: ReasonValue) => void;
  label?: string;
  required?: boolean;
  /** "The applicant will see" — omit for internal notes (shown as audit-log only). */
  audience?: string;
  detailsPlaceholder?: string;
}) {
  const [detailsOpen, setDetailsOpen] = useState(value.details.length > 0);
  const detailsRef = useRef<HTMLTextAreaElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const latest = useRef({ value, onChange });
  latest.current = { value, onChange };

  const toggle = (index: number) => {
    const { value: current, onChange: change } = latest.current;
    change({
      ...current,
      selected: current.selected.includes(index) ? current.selected.filter((i) => i !== index) : [...current.selected, index],
    });
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      // Only the chips in the topmost open dialog answer, e.g. the license
      // reject dialog over the vehicle Quick Action that also has chips.
      const dialogs = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
      const top = dialogs[dialogs.length - 1];
      if (top && rootRef.current && !top.contains(rootRef.current)) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= Math.min(9, presets.length)) {
        e.preventDefault();
        toggle(n - 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presets.length]);

  useEffect(() => {
    if (detailsOpen) detailsRef.current?.focus();
  }, [detailsOpen]);

  const preview = composeReason(presets, value);

  return (
    <div ref={rootRef} className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </p>
        <p className="hidden sm:block text-[11px] text-muted-foreground">Press 1–{Math.min(9, presets.length)} to pick</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset, index) => {
          const active = value.selected.includes(index);
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => toggle(index)}
              aria-pressed={active}
              title={preset.text}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-secondary/60 text-foreground hover:border-primary/50 hover:bg-secondary',
              )}
            >
              {active ? (
                <Check className="h-3.5 w-3.5" />
              ) : index < 9 ? (
                <span className="text-[11px] font-semibold text-muted-foreground">{index + 1}</span>
              ) : null}
              {preset.label}
            </button>
          );
        })}
      </div>

      {detailsOpen ? (
        <textarea
          ref={detailsRef}
          value={value.details}
          onChange={(e) => onChange({ ...value, details: e.target.value })}
          placeholder={detailsPlaceholder}
          rows={2}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      ) : (
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="h-3.5 w-3.5" /> Add details
        </button>
      )}

      {preview ? (
        <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {audience ? `${audience} will see` : 'Saved to the audit log'}
          </p>
          <p className="mt-0.5 text-sm text-foreground">{preview}</p>
        </div>
      ) : null}
    </div>
  );
}
