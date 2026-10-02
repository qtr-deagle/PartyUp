import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearch } from 'wouter';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Eye, LifeBuoy, Search, Send, XCircle } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import GuildAuditLogDialog from '@/components/GuildAuditLogDialog';
import GuildEmblem from '@/components/GuildEmblem';
import { ImageLightbox } from '@/components/ImageLightbox';
import { useTableRealtime } from '@/hooks/useTableRealtime';
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
  open: 'bg-yellow-200/30 text-yellow-700 dark:text-yellow-400',
  reviewing: 'bg-orange-500/20 text-orange-600',
  resolved: 'bg-accent/20 text-accent',
  dismissed: 'bg-muted text-muted-foreground',
};

const STATUS_STYLES: Record<TicketStatus, string> = {
  open: 'bg-yellow-200/30 text-yellow-700 dark:text-yellow-400',
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
  const [isDeciding, setIsDeciding] = useState(false);
  const [auditGuild, setAuditGuild] = useState<SupportTicketRow['guild']>(null);
  const [tickets, setTickets] = useState<SupportTicketRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('open');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TicketMessageRow[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);
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

  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null;
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

  const handleReply = async () => {
    if (!selected || !reply.trim()) return;
    setIsSending(true);
    const { error } = await replyToTicket(selected.id, reply);
    setIsSending(false);
    if (error) {
      toast.error(`Failed to send reply: ${error.message}`);
      return;
    }
    setReply('');
    toast.success('Reply sent. The traveler was notified.');
    await Promise.all([loadMessages(selected.id), loadTickets(statusFilter, true)]);
  };

  // Report decisions go to reports (points, payments, counts) and the
  // database replies to the reporter in this ticket.
  const handleDecision = async (status: ReportStatus, notes?: string) => {
    if (!selected?.report) return;
    setIsDeciding(true);
    const { error } = await updateReportStatus(selected.report.id, status, notes ?? selected.report.resolution_notes ?? undefined);
    setIsDeciding(false);
    if (error) {
      toast.error(`Failed to update report: ${error.message}`);
      return;
    }
    setDecision(null);
    toast.success(status === 'reviewing' ? 'Marked as investigating. The reporter was told.' : 'Report updated. The reporter got a reply.');
    await Promise.all([loadTickets(statusFilter, true), loadMessages(selected.id)]);
  };

  const handleStatus = async (status: TicketStatus) => {
    if (!selected) return;
    const { error } = await setTicketStatus(selected.id, status);
    if (error) {
      toast.error(`Failed to update ticket: ${error.message}`);
      return;
    }
    await loadTickets(statusFilter, true);
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
          <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
            {isLoading ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">Loading...</p>
            ) : filteredTickets.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">No tickets found</p>
            ) : (
              <ul className="divide-y divide-border max-h-[70vh] overflow-y-auto">
                {filteredTickets.map((ticket) => (
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
                        {ticket.user?.display_name ?? 'Unknown'} · {TICKET_CATEGORY_LABELS[ticket.category]} · {new Date(ticket.last_message_at).toLocaleString()}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
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
                      {selected.user?.display_name ?? 'Unknown'} · {TICKET_CATEGORY_LABELS[selected.category]} · opened {new Date(selected.created_at).toLocaleString()}
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
                    {(selected.report.status === 'open' || selected.report.status === 'reviewing') &&
                      (decision ? (
                        <div className="space-y-2">
                          <textarea
                            value={decision.notes}
                            onChange={(e) => setDecision({ ...decision, notes: e.target.value })}
                            rows={3}
                            placeholder="What was done? The reporter sees this in their ticket."
                            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => setDecision(null)} className="flex-1 border border-border py-2 rounded-lg text-sm font-semibold hover:bg-secondary">
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDecision(decision.status, decision.notes)}
                              disabled={isDeciding}
                              className={`flex-1 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50 ${decision.status === 'resolved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                            >
                              {decision.status === 'resolved' ? 'Resolve report' : 'Dismiss report'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 flex-wrap">
                          {selected.report.status === 'open' && (
                            <button onClick={() => handleDecision('reviewing')} disabled={isDeciding} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-semibold hover:bg-secondary disabled:opacity-50">
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
                      ))}
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
                        <p className={`text-[11px] mt-1 ${message.from_staff ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{new Date(message.created_at).toLocaleString()}</p>
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
                    onClick={handleReply}
                    disabled={isSending || !reply.trim()}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {isSending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      <GuildAuditLogDialog guild={auditGuild} onClose={() => setAuditGuild(null)} />
    </AdminLayout>
  );
}
