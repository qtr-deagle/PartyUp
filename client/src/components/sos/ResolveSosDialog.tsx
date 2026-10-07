import ConfirmActionDialog from '@/components/ConfirmActionDialog';
import { resolveSosAlert } from '@/lib/sos';
import { runUndoable, usePendingUndoKeys } from '@/lib/undoable';
import { formatDateTime, timeAgo } from '@/lib/datetime';

// Every "Resolve SOS" in the console goes through this dialog. Resolving
// ends the emergency, stops the phone's live tracking and tells the
// trusted circle, so the admin must tick that they confirmed the person is
// safe and write how it was resolved. The write is then held for the Undo
// window, and tracking keeps running until it actually saves.

export interface ResolvableSos {
  id: string;
  created_at: string;
  name: string | null;
}

export const sosUndoKey = (alertId: string) => `sos:${alertId}`;

/** True while a resolve for this alert is inside its Undo window. */
export function useSosResolving() {
  const pending = usePendingUndoKeys();
  return (alertId: string) => pending.has(sosUndoKey(alertId));
}

export function startSosResolve(alert: ResolvableSos, notes: string, onCommitted?: () => void) {
  const name = alert.name ?? 'this traveler';
  runUndoable({
    key: sosUndoKey(alert.id),
    message: `Resolving ${name}'s SOS…`,
    description: 'Live tracking continues until this saves.',
    commit: () => resolveSosAlert(alert.id, notes),
    onCommitted,
    success: `${name}'s SOS resolved. Their trusted circle was told.`,
    error: 'Failed to resolve SOS alert',
  });
}

export default function ResolveSosDialog({
  alert,
  onClose,
  onCommitted,
}: {
  alert: ResolvableSos | null;
  onClose: () => void;
  onCommitted?: () => void;
}) {
  const name = alert?.name ?? 'this traveler';
  return (
    <ConfirmActionDialog
      open={alert !== null}
      onOpenChange={(open) => !open && onClose()}
      tone="destructive"
      title={`Resolve SOS for ${name}?`}
      description={
        <>
          This ends the emergency, <span className="font-semibold text-foreground">stops their live location tracking</span>,
          and tells their trusted circle. Only resolve after you have confirmed they are safe.
        </>
      }
      checkbox={{ label: `I have confirmed that ${name} is safe` }}
      notes={{
        label: 'How was it resolved?',
        required: true,
        placeholder: 'e.g. Called them at 3:40 PM, they were at the hospital with family and are fine.',
      }}
      confirmLabel="Resolve SOS"
      onConfirm={(notes) => {
        if (alert) startSosResolve(alert, notes, onCommitted);
      }}
    >
      {alert && (
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">SOS pressed</p>
            <p className="font-medium text-foreground">{formatDateTime(alert.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Active for</p>
            <p className="font-medium text-foreground">{timeAgo(alert.created_at).replace(' ago', '')}</p>
          </div>
        </div>
      )}
    </ConfirmActionDialog>
  );
}
