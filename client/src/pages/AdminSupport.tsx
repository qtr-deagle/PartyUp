import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearch } from 'wouter';
import { toast } from 'sonner';
import { clearDraft, loadDraft, saveDraft } from '@/lib/drafts';
import { AlertCircle, Archive, CheckCircle, Eye, Flag, HelpCircle, LifeBuoy, Plane, RotateCcw, Send, UserRound, XCircle } from 'lucide-react';
import { Avatar, Pill, SearchField, Segmented, type PillTone } from '@/components/admin/AdminUI';
import { EmptyDetail, Kbd, QueueItem, QueuePanel, ReviewPage, ReviewToolbar, useReviewShortcuts } from '@/components/review/ReviewWorkspace';
import AdminLayout from '@/components/AdminLayout';
import GuildAuditLogDialog from '@/components/GuildAuditLogDialog';
import GuildEmblem from '@/components/GuildEmblem';
import { ImageLightbox } from '@/components/ImageLightbox';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { useClientPagination } from '@/hooks/usePagination';
import ConfirmActionDialog from '@/components/ConfirmActionDialog';
import { REASON_PRESETS } from '@/lib/reasonPresets';
import { instantUndoable, runUndoable } from '@/lib/undoable';
import { formatDateTime, timeAgo } from '@/lib/datetime';
import { updateReportStatus, type ReportStatus } from '@/lib/reports';
import {
  getTicketMessages,
  getTicketPhotoUrls,
  listTickets,
  replyToTicket,
  setTicketStatus,
  TICKET_CATEGORY_LABELS,
  TICKET_STATUS_LABELS,
  type SupportTicketRow,
  type TicketMessageRow,
  type TicketStatus,
} from '@/lib/supportTickets';

const STATUS_FILTERS: Array<TicketStatus | 'all'> = ['open', 'answered', 'closed', 'all'];

// Reports are tickets too (one per report); "Questions" are everything else.
type View = 'all' | 'reports' | 'questions';
const REPORT_STATUS_TONE: Record<ReportStatus, PillTone> = {
  open: 'yellow',
  reviewing: 'orange',
  resolved: 'green',
  dismissed: 'gray',
};

/**
 * The admins' one inbox: support tickets from the app's Help & Reports, and
 * every report (each report has a ticket). Reply, close or reopen; for
 * reports also investigate / resolve / dismiss, which replies to the reporter.
 */
export default function AdminSupport() {
  const search = useSearch();
  const [view, setView] = useState<View>(() => {
    const requested = new URLSearchParams(search).get('view');
    return requested === 'reports' || requested === 'questions' ? requested : 'all';
  });
  const [decision, setDecision] = useState<{ status: ReportStatus; notes: string } | null>(null);
  const [reportPatch, setReportPatch] = useState<Record<string, ReportStatus>>({});
  const [confirmReply, setConfirmReply] = useState(false);
  const [auditGuild, setAuditGuild] = useState<SupportTicketRow['guild']>(null);
  const [tickets, setTickets] = useState<SupportTicketRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // ?report=<id> (from the dashboard's Recent Open Reports) opens that
  // report's ticket. Its ticket may already be answered, so show all statuses.
  const [linkedReportId, setLinkedReportId] = useState(() => new URLSearchParams(search).get('report'));
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>(() => (linkedReportId ? 'all' : 'open'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TicketMessageRow[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  // Unsent replies are kept per ticket, so switching tickets (or reloading)
  // never loses or carries over a half-written reply.
  const [replies, setReplies] = useState<Record<string, string>>(() => {
    const saved = loadDraft<Record<string, string>>('admin-support-replies');
    return saved?.value ?? {};
  });
  const reply = selectedId ? (replies[selectedId] ?? '') : '';
  const setReply = (text: string) => {
    if (!selectedId) return;
    setReplies((current) => {
      const next = { ...current };
      if (text.trim()) next[selectedId] = text;
      else delete next[selectedId];
      if (Object.keys(next).length) saveDraft('admin-support-replies', next);
      else clearDraft('admin-support-replies');
      return next;
    });
  };
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const loadTickets = useCallback(async (status: TicketStatus | 'all', silent = false) => {
    if (!silent) setIsLoading(true);
    const { data, error } = await listTickets(status === 'all' ? undefined : status);
    if (error) toast.error(`Failed to load tickets: ${error.message}`);
    setTickets(data);
    setIsLoading(false);
  }, []);

  const loadMessages = useCallback(async (ticketId: string) => {
    const { data, error } = await getTicketMessages(ticketId);
    if (error) toast.error(`Failed to load messages: ${error.message}`);
    setMessages(data);
  }, []);

  useEffect(() => {
    void loadTickets(statusFilter);
  }, [statusFilter, loadTickets]);

  useEffect(() => {
    if (!linkedReportId || isLoading) return;
    const linked = tickets.find((ticket) => ticket.report_id === linkedReportId);
    if (linked) setSelectedId(linked.id);
    else toast.error('That report could not be found.');
    setLinkedReportId(null);
  }, [linkedReportId, isLoading, tickets]);

  const selectedRaw = tickets.find((ticket) => ticket.id === selectedId) ?? null;
  // Show a held report decision right away.
  const selected =
    selectedRaw?.report && reportPatch[selectedRaw.report.id]
      ? { ...selectedRaw, report: { ...selectedRaw.report, status: reportPatch[selectedRaw.report.id] } }
      : selectedRaw;
  const selectedPhotoKey = selected?.evidence_paths.join('|') ?? '';

  useEffect(() => {
    if (!selectedId) return;
    void loadMessages(selectedId);
  }, [selectedId, loadMessages]);

  useEffect(() => {
    let cancelled = false;
    void getTicketPhotoUrls(selectedPhotoKey ? selectedPhotoKey.split('|') : []).then((urls) => {
      if (!cancelled) setPhotos(urls);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedPhotoKey]);

  useTableRealtime(['support_tickets', 'support_ticket_messages'], () => {
    void loadTickets(statusFilter, true);
    if (selectedId) void loadMessages(selectedId);
  });

  const filteredTickets = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return tickets.filter(
      (ticket) =>
        (view === 'all' || (view === 'reports') === Boolean(ticket.report_id)) &&
        (ticket.subject.toLowerCase().includes(term) ||
        (ticket.user?.display_name ?? '').toLowerCase().includes(term) ||
        (ticket.reported_user?.display_name ?? '').toLowerCase().includes(term) ||
        (ticket.guild?.name ?? '').toLowerCase().includes(term))
    );
  }, [tickets, searchTerm, view]);
  const ticketsPage = useClientPagination(filteredTickets, [searchTerm, view, statusFilter], 25);

  // A sent message can't be unsent, so replies are confirm-only.
  const handleReply = async () => {
    if (!selected || !reply.trim()) return false;
    const ticketId = selected.id;
    const { error } = await replyToTicket(ticketId, reply);
    if (error) {
      toast.error(`Failed to send reply: ${error.message}`);
      return false;
    }
    setReply('');
    toast.success('Reply sent. The traveler was notified.');
    await Promise.all([loadMessages(ticketId), loadTickets(statusFilter, true)]);
  };

  // Report decisions go to reports (points, payments, counts) and the
  // database replies to the reporter in this ticket. Held for the Undo
  // window so an undone decision never messages the reporter.
  const handleDecision = (status: ReportStatus, notes?: string) => {
    if (!selected?.report) return;
    const ticketId = selected.id;
    const report = selected.report;
    const label = status === 'reviewing' ? 'Marking as investigating' : status === 'resolved' ? 'Resolving report' : 'Dismissing report';
    runUndoable({
      key: `report:${report.id}`,
      message: `${label}…`,
      description: 'The reporter is told once this saves.',
      onHide: () => setReportPatch((prev) => ({ ...prev, [report.id]: status })),
      onRestore: () => setReportPatch(({ [report.id]: _, ...rest }) => rest),
      commit: () => updateReportStatus(report.id, status, notes ?? report.resolution_notes ?? undefined),
      onCommitted: () =>
        void Promise.all([loadTickets(statusFilter, true), loadMessages(ticketId)]).then(() =>
          setReportPatch(({ [report.id]: _, ...rest }) => rest)
        ),
      success:
        status === 'reviewing'
          ? 'Marked as investigating. The reporter was told.'
          : status === 'resolved'
            ? 'Report resolved. The reporter got a reply.'
            : 'Report dismissed. The reporter got a reply.',
      error: 'Failed to update report',
    });
  };

  // Close/reopen is a silent status flip, so it saves now and Undo flips it back.
  const handleStatus = (status: TicketStatus) => {
    if (!selected) return;
    const ticket = selected;
    const previous = ticket.status;
    void instantUndoable({
      key: `ticket-status:${ticket.id}`,
      run: () => setTicketStatus(ticket.id, status),
      revert: () => setTicketStatus(ticket.id, previous),
      success: status === 'closed' ? `Closed "${ticket.subject}"` : `Reopened "${ticket.subject}"`,
      error: 'Failed to update ticket',
      onDone: () => void loadTickets(statusFilter, true),
    });
  };

  const ticketIds = useMemo(() => filteredTickets.map((ticket) => ticket.id), [filteredTickets]);
  const selectTicket = (id: string) => {
    setSelectedId(id);
    setDecision(null);
    const index = ticketIds.indexOf(id);
    if (index >= 0) ticketsPage.setPage(Math.floor(index / ticketsPage.pageSize) + 1);
  };
  useReviewShortcuts({ ids: ticketIds, selectedId, onSelect: selectTicket, enabled: !lightboxSrc && !auditGuild });

  // Newest message in view whenever the thread changes.
  const threadEnd = useRef<HTMLDivElement>(null);

  // The reply box starts one line tall (same height as Send) and grows with the text, up to ~8 lines.
  const replyBox = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const box = replyBox.current;
    if (!box) return;
    box.style.height = 'auto';
    box.style.height = `${Math.min(box.scrollHeight, 180)}px`;
  }, [reply, selectedId]);
  useEffect(() => {
    threadEnd.current?.scrollIntoView({ block: 'end' });
  }, [messages, selectedId]);

  const openCount = tickets.filter((ticket) => ticket.status === 'open').length;

  return (
    <AdminLayout>
      <ReviewPage
        toolbar={
          <ReviewToolbar title="Support & Reports" subtitle="One inbox for help requests and reports from the app">
            <Segmented
              value={view}
              options={[
                { value: 'all' as const, label: 'Everything' },
                { value: 'reports' as const, label: <><Flag className="w-3.5 h-3.5" /> Reports</> },
                { value: 'questions' as const, label: <><HelpCircle className="w-3.5 h-3.5" /> Questions</> },
              ]}
              onChange={setView}
            />
            <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Search subject, traveler or guild..." />
            <Segmented
              value={statusFilter}
              options={STATUS_FILTERS.map((status) => ({
                value: status,
                label:
                  status === 'open' && statusFilter === 'open' && openCount > 0 ? (
                    <>
                      Open <span className="min-w-5 rounded-full bg-orange-500 px-1.5 text-xs font-bold text-white">{openCount}</span>
                    </>
                  ) : status === 'all' ? (
                    'All'
                  ) : (
                    TICKET_STATUS_LABELS[status]
                  ),
              }))}
              onChange={setStatusFilter}
            />
          </ReviewToolbar>
        }
      >
        <QueuePanel
          title="Inbox"
          count={filteredTickets.length}
          isLoading={isLoading}
          emptyText={searchTerm ? 'No tickets match your search' : 'Inbox zero. Nothing here.'}
          pagination={ticketsPage}
          itemLabel="tickets"
        >
          {ticketsPage.pageItems.map((ticket) => (
            <QueueItem
              key={ticket.id}
              selected={selectedId === ticket.id}
              onSelect={() => selectTicket(ticket.id)}
              title={ticket.subject}
              avatar={ticket.user?.display_name ?? '?'}
              subtitle={`${ticket.user?.display_name ?? 'Unknown'} · ${TICKET_CATEGORY_LABELS[ticket.category]}`}
              status={ticket.status === 'open' ? 'pending' : ticket.status === 'answered' ? 'approved' : undefined}
              meta={timeAgo(ticket.last_message_at)}
              badges={
                ticket.report ? (
                  <Pill tone="red" className="capitalize">
                    <Flag className="w-3 h-3" /> {ticket.report.report_type}
                  </Pill>
                ) : undefined
              }
            />
          ))}
        </QueuePanel>

        {selected ? (
          <section className="flex flex-col min-h-0 rounded-2xl border border-border bg-card shadow-elevation-2 overflow-hidden">
            {/* Header */}
            <header className="flex flex-wrap items-start gap-x-4 gap-y-2 border-b border-border px-5 py-3.5">
              <Avatar name={selected.user?.display_name} />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-bold text-foreground">{selected.subject}</h2>
                <p className="truncate text-xs text-muted-foreground">
                  {selected.user?.display_name ?? 'Unknown'} · {TICKET_CATEGORY_LABELS[selected.category]} · opened {formatDateTime(selected.created_at)}
                </p>
              </div>
              <Pill tone={selected.status === 'open' ? 'yellow' : selected.status === 'answered' ? 'blue' : 'gray'} dot>
                {TICKET_STATUS_LABELS[selected.status]}
              </Pill>
              {selected.status !== 'closed' ? (
                <button
                  onClick={() => handleStatus('closed')}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-secondary transition-colors"
                >
                  <Archive className="w-3.5 h-3.5" /> Close
                </button>
              ) : (
                <button
                  onClick={() => handleStatus('open')}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-secondary transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reopen
                </button>
              )}
            </header>

            {/* Context: who it's about, guild, trip, report actions, photos */}
            {(selected.reported_user || selected.guild || selected.trip || selected.report || photos.length > 0) && (
              <div className="space-y-3 border-b border-border bg-secondary/30 px-5 py-3">
                {(selected.reported_user || selected.guild || selected.trip) && (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {selected.reported_user && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1">
                        <UserRound className="w-3.5 h-3.5 text-muted-foreground" />
                        About <span className="font-semibold text-foreground">{selected.reported_user.display_name}</span>
                        {selected.category === 'guild_leader' ? ' (Guild Leader)' : ''}
                      </span>
                    )}
                    {selected.guild && (
                      <button
                        onClick={() => setAuditGuild(selected.guild)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 font-medium text-foreground hover:border-primary/50 hover:text-primary transition-smooth"
                        title="Open the guild's audit log"
                      >
                        <GuildEmblem emblem={selected.guild.emblem} color={selected.guild.color} size={16} />
                        {selected.guild.name} · audit log
                      </button>
                    )}
                    {selected.trip && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1">
                        <Plane className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-medium text-foreground">{selected.trip.title}</span>
                      </span>
                    )}
                  </div>
                )}

                {selected.report && (
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-300/60 bg-red-500/5 px-3 py-2.5 dark:border-red-500/30">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-semibold text-foreground capitalize">{selected.report.report_type} report</span>
                    <Pill tone={REPORT_STATUS_TONE[selected.report.status]} className="capitalize">
                      {selected.report.status === 'reviewing' ? 'investigating' : selected.report.status}
                    </Pill>
                    {selected.report.guild_report_id && <span className="text-xs text-muted-foreground">Escalated by the guild</span>}
                    {(selected.report.status === 'open' || selected.report.status === 'reviewing') && (
                      <div className="ml-auto flex flex-wrap gap-2">
                        {selected.report.status === 'open' && (
                          <button
                            onClick={() => handleDecision('reviewing')}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-secondary"
                          >
                            <Eye className="w-3.5 h-3.5 text-primary" /> Investigate
                          </button>
                        )}
                        <button
                          onClick={() => setDecision({ status: 'dismissed', notes: '' })}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-red-300 text-red-600 text-xs font-semibold hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Dismiss
                        </button>
                        <button
                          onClick={() => setDecision({ status: 'resolved', notes: '' })}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Resolve
                        </button>
                      </div>
                    )}
                    {selected.report.resolution_notes && (
                      <p className="basis-full text-xs text-muted-foreground whitespace-pre-wrap">Notes: {selected.report.resolution_notes}</p>
                    )}
                  </div>
                )}

                {photos.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {photos.map((url) => (
                      <button
                        key={url}
                        onClick={() => setLightboxSrc(url)}
                        className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border hover:ring-2 hover:ring-primary transition-smooth"
                      >
                        <img src={url} alt="Ticket attachment" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Conversation */}
            <div className="flex-1 min-h-[14rem] overflow-y-auto overscroll-contain px-5 py-4 space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-end gap-2 ${message.from_staff ? 'flex-row-reverse' : ''}`}>
                  {message.from_staff ? (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">P</span>
                  ) : (
                    <Avatar name={message.sender?.display_name} size="sm" />
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      message.from_staff ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-secondary text-foreground'
                    }`}
                  >
                    <p className={`text-[11px] font-semibold mb-0.5 ${message.from_staff ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {message.from_staff ? `PartyUp · ${message.sender?.display_name ?? 'admin'}` : (message.sender?.display_name ?? 'Traveler')}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                    <p className={`text-[10px] mt-1 ${message.from_staff ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{formatDateTime(message.created_at)}</p>
                  </div>
                </div>
              ))}
              <div ref={threadEnd} />
            </div>

            {/* Composer */}
            <footer className="border-t border-border bg-card px-4 py-3">
              <div className="flex items-end gap-2 rounded-xl border border-border bg-secondary/40 p-1.5 pl-2 focus-within:ring-2 focus-within:ring-primary">
                <textarea
                  ref={replyBox}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && reply.trim()) setConfirmReply(true);
                  }}
                  rows={1}
                  maxLength={2000}
                  placeholder={`Reply to ${selected.user?.display_name ?? 'the traveler'} (they get a notification)`}
                  className="block min-h-9 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2 text-sm leading-5 text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  onClick={() => setConfirmReply(true)}
                  disabled={!reply.trim()}
                  className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
              <p className="mt-1.5 hidden xl:flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Kbd>Ctrl</Kbd>+<Kbd>Enter</Kbd> to send · <Kbd>Q</Kbd>
                <Kbd>W</Kbd> previous / next ticket
              </p>
            </footer>
          </section>
        ) : (
          <EmptyDetail icon={LifeBuoy} text={isLoading ? 'Loading the inbox…' : 'Pick a ticket to read and reply'} />
        )}
      </ReviewPage>

      {/* Resolve / dismiss a report */}
      <ConfirmActionDialog
        open={decision !== null}
        onOpenChange={(open) => !open && setDecision(null)}
        tone={decision?.status === 'dismissed' ? 'destructive' : 'default'}
        title={decision?.status === 'resolved' ? 'Resolve this report?' : 'Dismiss this report?'}
        description={
          decision?.status === 'resolved'
            ? 'The report is closed as handled and the reporter gets your notes as a reply.'
            : 'The report is closed with no action and the reporter gets your notes as a reply.'
        }
        notes={{
          label: 'Notes for the reporter',
          required: true,
          placeholder: 'Add details (optional)',
          presets: decision?.status === 'dismissed' ? REASON_PRESETS.reportDismiss : REASON_PRESETS.reportResolve,
          audience: 'The reporter',
        }}
        confirmLabel={decision?.status === 'resolved' ? 'Resolve report' : 'Dismiss report'}
        onConfirm={(notes) => {
          if (decision) handleDecision(decision.status, notes);
        }}
      />

      {/* Reply (confirm only: messages can't be unsent) */}
      <ConfirmActionDialog
        open={confirmReply}
        onOpenChange={setConfirmReply}
        title={`Send this reply to ${selected?.user?.display_name ?? 'the traveler'}?`}
        description="They get a notification right away, and a sent message can't be taken back."
        confirmLabel="Send reply"
        onConfirm={handleReply}
      >
        <p className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-secondary px-3 py-2 text-sm text-foreground">{reply.trim()}</p>
      </ConfirmActionDialog>

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      <GuildAuditLogDialog guild={auditGuild} onClose={() => setAuditGuild(null)} />
    </AdminLayout>
  );
}
