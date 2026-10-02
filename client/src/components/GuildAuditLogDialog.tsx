import { useEffect, useState } from 'react';
import GuildEmblem from '@/components/GuildEmblem';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { describeGuildAuditEvent, getGuildAuditLog, GUILD_AUDIT_PAGE_SIZE, type GuildAuditEvent } from '@/lib/guildAudit';
import type { ReportRow } from '@/lib/reports';

type Guild = NonNullable<ReportRow['guild']>;

/** A guild's audit log, opened from an escalated guild report. */
export default function GuildAuditLogDialog({ guild, onClose }: { guild: Guild | null; onClose: () => void }) {
  const [events, setEvents] = useState<GuildAuditEvent[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!guild) return;
    let cancelled = false;
    setEvents(null);
    setErrorMessage(null);
    void getGuildAuditLog(guild.id).then(({ data, error }) => {
      if (cancelled) return;
      setErrorMessage(error?.message ?? null);
      setEvents(data);
      setHasMore(data.length === GUILD_AUDIT_PAGE_SIZE);
    });
    return () => {
      cancelled = true;
    };
  }, [guild]);

  const loadMore = async () => {
    const oldest = events?.[events.length - 1];
    if (!guild || !oldest) return;
    setIsLoadingMore(true);
    const { data, error } = await getGuildAuditLog(guild.id, oldest.created_at);
    setIsLoadingMore(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setEvents((current) => [...(current ?? []), ...data]);
    setHasMore(data.length === GUILD_AUDIT_PAGE_SIZE);
  };

  return (
    <Dialog open={guild !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {guild && <GuildEmblem emblem={guild.emblem} color={guild.color} size={36} />}
            <div>
              <DialogTitle>{guild?.name ?? 'Guild'} · Audit Log</DialogTitle>
              <DialogDescription>Recorded by the database. Guild members can&apos;t edit or delete it.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        {events === null ? (
          <p className="text-sm text-muted-foreground text-center py-6">Loading...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nothing logged for this guild yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {events.map((event) => {
              const excerpt = typeof event.metadata?.excerpt === 'string' && event.metadata.excerpt ? event.metadata.excerpt : null;
              const isReport = event.action.startsWith('report_') || event.action === 'member_removed';
              return (
                <li key={event.id} className="px-4 py-3">
                  <p className={`text-sm ${isReport ? 'text-destructive' : 'text-foreground'}`}>{describeGuildAuditEvent(event)}</p>
                  {excerpt && <p className="text-xs italic text-muted-foreground mt-0.5 line-clamp-2">“{excerpt}”</p>}
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(event.created_at).toLocaleString()}</p>
                </li>
              );
            })}
          </ul>
        )}

        {hasMore && (
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="w-full border border-border text-foreground py-2 rounded-lg hover:bg-secondary font-semibold transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? 'Loading...' : 'Load older'}
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
