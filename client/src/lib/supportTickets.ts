import { supabase } from '@/lib/supabase';
import type { GuildEmblem } from '@/lib/guilds';
import type { ReportStatus, ReportType } from '@/lib/reports';

// Support tickets from the app's "Help & Reports" (mobile migration
// 202610030004). Admins read everything via RLS and write through RPCs.
// Every report is also a ticket (202610030005): `report` is set, and report
// decisions go through updateReportStatus in lib/reports.ts, which replies to
// the reporter in the ticket automatically.
// Keep categories in sync with TICKET_CATEGORY_LABELS in the mobile app's
// lib/support.ts.

export type TicketCategory = 'safety' | 'account' | 'payment' | 'trip' | 'bug' | 'other' | 'guild_leader';
export type TicketStatus = 'open' | 'answered' | 'closed';

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  safety: 'Safety or a user',
  account: 'Account',
  payment: 'Payments',
  trip: 'Trip',
  bug: 'App problem',
  other: 'Other',
  guild_leader: 'Guild Leader report',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Needs reply',
  answered: 'Answered',
  closed: 'Closed',
};

export interface SupportTicketRow {
  id: string;
  user_id: string;
  category: TicketCategory;
  subject: string;
  status: TicketStatus;
  reported_user_id: string | null;
  guild_id: string | null;
  trip_id: string | null;
  report_id: string | null;
  evidence_paths: string[];
  created_at: string;
  updated_at: string;
  last_message_at: string;
  user: { display_name: string; avatar_url: string | null } | null;
  reported_user: { display_name: string } | null;
  guild: { id: string; name: string; emblem: GuildEmblem; color: string } | null;
  trip: { title: string } | null;
  report: {
    id: string;
    report_type: ReportType;
    status: ReportStatus;
    resolution_notes: string | null;
    guild_report_id: string | null;
  } | null;
}

export interface TicketMessageRow {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  from_staff: boolean;
  body: string;
  created_at: string;
  sender: { display_name: string } | null;
}

const TICKET_COLUMNS =
  '*, user:profiles!support_tickets_user_id_fkey(display_name, avatar_url), reported_user:profiles!support_tickets_reported_user_id_fkey(display_name), guild:guilds(id, name, emblem, color), trip:trips(title), report:reports!support_tickets_report_id_fkey(id, report_type, status, resolution_notes, guild_report_id)';

export async function listTickets(status?: TicketStatus) {
  let query = supabase.from('support_tickets').select(TICKET_COLUMNS).order('last_message_at', { ascending: false }).limit(300);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  return { data: (data ?? []) as unknown as SupportTicketRow[], error };
}

export async function getTicketMessages(ticketId: string) {
  const { data, error } = await supabase
    .from('support_ticket_messages')
    .select('*, sender:profiles!support_ticket_messages_sender_id_fkey(display_name)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });
  return { data: (data ?? []) as unknown as TicketMessageRow[], error };
}

export async function replyToTicket(ticketId: string, body: string) {
  const { error } = await supabase.rpc('reply_support_ticket', { p_ticket_id: ticketId, p_body: body.trim() });
  return { error };
}

export async function setTicketStatus(ticketId: string, status: TicketStatus) {
  const { error } = await supabase.rpc('set_support_ticket_status', { p_ticket_id: ticketId, p_status: status });
  return { error };
}

export async function getTicketPhotoUrls(paths: string[]) {
  if (paths.length === 0) return [];
  const { data } = await supabase.storage.from('report-evidence').createSignedUrls(paths, 300);
  return (data ?? []).map((row) => row.signedUrl).filter((url): url is string => Boolean(url));
}
