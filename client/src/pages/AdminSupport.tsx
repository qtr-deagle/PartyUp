import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearch } from 'wouter';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Eye, LifeBuoy, Search, Send, XCircle } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import GuildAuditLogDialog from '@/components/GuildAuditLogDialog';
import GuildEmblem from '@/components/GuildEmblem';
import { ImageLightbox } from '@/components/ImageLightbox';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { useClientPagination } from '@/hooks/usePagination';
import TablePagination from '@/components/TablePagination';
import ConfirmActionDialog from '@/components/ConfirmActionDialog';
import { instantUndoable, runUndoable } from '@/lib/undoable';
import { formatDateTime } from '@/lib/datetime';
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
const VIEWS: Array<{ id: View; label: string }> = [
  { id: 'all', label: 'Everything' },
  { id: 'reports', label: 'Reports' },
  { id: 'questions', label: 'Questions' },
];

const REPORT_STATUS_STYLES: Record<ReportStatus, string> = {
  open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  reviewing: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300',
  resolved: 'bg-accent/20 text-accent',
  dismissed: 'bg-muted text-muted-foreground',
};

const STATUS_STYLES: Record<TicketStatus, string> = {
  open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  answered: 'bg-primary/20 text-primary',
  closed: 'bg-muted text-muted-foreground',
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
  const [reply, setReply] = useState('');
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
  const ticketsPage = useClientPagination(filteredTickets, [searchTerm, view, statusFilter]);

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <LifeBuoy className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Support & Reports</h1>
        </div>

        <div className="flex gap-2 flex-wrap">
          {VIEWS.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-smooth border ${
                view === item.id ? 'border-primary text-primary bg-primary/10' : 'border-border text-foreground hover:bg-secondary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-smooth ${
                statusFilter === status ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              {status === 'all' ? 'All' : TICKET_STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by subject, traveler, reported user or guild..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Ticket list */}
          <div data-paginated className="self-start bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
            {isLoading ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">Loading...</p>
            ) : filteredTickets.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">No tickets found</p>
            ) : (
              <>
              <ul className="divide-y divide-border">
                {ticketsPage.pageItems.map((ticket) => (
                  <li key={ticket.id}>
                    <button
                      onClick={() => {
                        setSelectedId(ticket.id);
                        setDecision(null);
                      }}
                      className={`w-full text-left px-5 py-4 transition-smooth hover:bg-secondary/50 ${selectedId === ticket.id ? 'bg-secondary' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-foreground truncate">{ticket.subject}</p>
                        <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[ticket.status]}`}>
                          {TICKET_STATUS_LABELS[ticket.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {ticket.report && <span className="font-semibold text-destructive capitalize">{ticket.report.report_type} report · </span>}
                        {ticket.user?.display_name ?? 'Unknown'} · {TICKET_CATEGORY_LABELS[ticket.category]} · {formatDateTime(ticket.last_message_at)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
              <TablePagination pagination={ticketsPage} itemLabel="tickets" compact />
              </>
            )}
          </div>

          {/* Selected ticket */}
          <div className="bg-card rounded-2xl shadow-elevation-2 border border-border p-6 min-h-[320px]">
            {!selected ? (
              <p className="text-sm text-muted-foreground text-center py-16">Pick a ticket to read and reply.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selected.subject}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selected.user?.display_name ?? 'Unknown'} · {TICKET_CATEGORY_LABELS[selected.category]} · opened {formatDateTime(selected.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {selected.status !== 'closed' ? (
                      <button onClick={() => handleStatus('closed')} className="px-3 py-1.5 rounded-lg border border-border text-sm font-semibold hover:bg-secondary transition-colors">
                        Close
                      </button>
                    ) : (
                      <button onClick={() => handleStatus('open')} className="px-3 py-1.5 rounded-lg border border-border text-sm font-semibold hover:bg-secondary transition-colors">
                        Reopen
                      </button>
                    )}
                  </div>
                </div>

                {(selected.reported_user || selected.guild || selected.trip) && (
                  <div className="bg-secondary rounded-lg p-3 border border-border text-sm space-y-1.5">
                    {selected.reported_user && <p><span className="text-muted-foreground">About:</span> {selected.reported_user.display_name}{selected.category === 'guild_leader' ? ' (Guild Leader)' : ''}</p>}
                    {selected.guild && (
                      <button
                        onClick={() => setAuditGuild(selected.guild)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-0.5 text-xs font-medium text-foreground hover:bg-secondary/70 transition-smooth"
                        title="Open the guild's audit log"
                      >
                        <GuildEmblem emblem={selected.guild.emblem} color={selected.guild.color} size={16} />
                        From guild {selected.guild.name} · audit log
                      </button>
                    )}
                    {selected.trip && <p><span className="text-muted-foreground">Trip:</span> {selected.trip.title}</p>}
                  </div>
                )}

                {selected.report && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-semibold text-foreground capitalize">{selected.report.report_type} report</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${REPORT_STATUS_STYLES[selected.report.status]}`}>
                        {selected.report.status}
                      </span>
                      {selected.report.guild_report_id && <span className="text-xs text-muted-foreground">Escalated by the guild</span>}
                    </div>
                    {selected.report.resolution_notes && (
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">Notes: {selected.report.resolution_notes}</p>
                    )}
                    {(selected.report.status === 'open' || selected.report.status === 'reviewing') && (
                      <div className="flex gap-2 flex-wrap">
                        {selected.report.status === 'open' && (
                          <button onClick={() => handleDecision('reviewing')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-semibold hover:bg-secondary">
                            <Eye className="w-4 h-4 text-primary" /> Investigate
                          </button>
                        )}
                        <button onClick={() => setDecision({ status: 'resolved', notes: '' })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-semibold hover:bg-secondary">
                          <CheckCircle className="w-4 h-4 text-green-600" /> Resolve
                        </button>
                        <button onClick={() => setDecision({ status: 'dismissed', notes: '' })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-semibold hover:bg-secondary">
                          <XCircle className="w-4 h-4 text-destructive" /> Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {photos.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {photos.map((url) => (
                      <button key={url} onClick={() => setLightboxSrc(url)} className="w-20 h-20 rounded-lg overflow-hidden border border-border">
                        <img src={url} alt="Ticket attachment" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.from_staff ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.from_staff ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                        <p className={`text-xs font-semibold mb-1 ${message.from_staff ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {message.from_staff ? `PartyUp (${message.sender?.display_name ?? 'admin'})` : (message.sender?.display_name ?? 'Traveler')}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                        <p className={`text-[11px] mt-1 ${message.from_staff ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{formatDateTime(message.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 items-end">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder="Reply to the traveler (they get a notification)"
                    className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  />
                  <button
                    onClick={() => setConfirmReply(true)}
                    disabled={!reply.trim()}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
          placeholder: 'What was done? The reporter sees this in their ticket.',
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
