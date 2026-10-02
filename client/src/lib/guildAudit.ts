import { supabase } from '@/lib/supabase';

// A guild's audit log (mobile migration 202610030002): written only by the
// database, read via get_guild_audit_log(). Admins pass can_manage_guild, so
// they can read any guild's log. Keep describeGuildAuditEvent in sync with
// describeAuditEvent in the mobile app's lib/guildReports.ts.

export interface GuildAuditEvent {
  id: string;
  action: string;
  actor_id: string | null;
  actor_name: string | null;
  target_user_id: string | null;
  target_name: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const GUILD_AUDIT_PAGE_SIZE = 50;

export async function getGuildAuditLog(guildId: string, before?: string) {
  const { data, error } = await supabase.rpc('get_guild_audit_log', {
    p_guild_id: guildId,
    p_before: before ?? null,
    p_limit: GUILD_AUDIT_PAGE_SIZE,
  });
  return { data: (data ?? []) as GuildAuditEvent[], error };
}

const CATEGORY_LABELS: Record<string, string> = {
  behavior: 'behavior',
  spam: 'spam or scam',
  safety: 'safety',
  other: 'other',
};

const SETTING_LABELS: Record<string, string> = {
  name: 'name',
  tagline: 'tagline',
  join_policy: 'joining rule',
  min_rank: 'minimum rank',
  description: 'description',
  focus: 'focus',
  areas: 'areas',
  emblem: 'emblem',
  color: 'color',
};

export function describeGuildAuditEvent(event: GuildAuditEvent) {
  const actor = event.actor_name ?? (event.actor_id ? 'A former member' : 'PartyUp');
  const target = event.target_name ?? 'a member';
  const meta = event.metadata ?? {};
  const fields = Array.isArray(meta.fields) ? (meta.fields as string[]).map((field) => SETTING_LABELS[field] ?? field).join(', ') : '';
  const category = typeof meta.category === 'string' ? CATEGORY_LABELS[meta.category] : null;
  const about = event.target_user_id ? ` about ${target}` : '';

  switch (event.action) {
    case 'member_joined':
      return event.actor_id && event.actor_id !== event.target_user_id ? `${actor} added ${target} to the guild` : `${target} joined the guild`;
    case 'member_left':
      return `${target} left the guild`;
    case 'member_removed':
      return `${actor} removed ${target} from the guild`;
    case 'leadership_transferred':
      return `${target} became the Guild Leader`;
    case 'settings_changed':
      return typeof meta.new_name === 'string' && typeof meta.old_name === 'string'
        ? `${actor} renamed the guild from ${meta.old_name} to ${meta.new_name}`
        : `${actor} changed the guild's ${fields || 'settings'}`;
    case 'appearance_changed':
      return `${actor} changed the guild's ${fields || 'look'}`;
    case 'announcement_set':
      return `${actor} posted an announcement`;
    case 'announcement_cleared':
      return `${actor} removed the announcement`;
    case 'join_request_accepted':
      return `${actor} accepted ${target}'s join request`;
    case 'join_request_declined':
      return `${actor} declined ${target}'s join request`;
    case 'invite_sent':
      return `${actor} invited ${target}`;
    case 'chat_message_deleted':
      return `${actor} removed a chat message from ${target}`;
    case 'report_filed':
      return `${event.actor_id ? actor : 'Someone (anonymous)'} filed a ${category ? `${category} ` : ''}report${about}`;
    case 'report_resolved':
      return `${actor} resolved a report${about}`;
    case 'report_dismissed':
      return `${actor} dismissed a report${about}`;
    case 'report_escalated':
      return meta.reason === 'leader'
        ? `${actor} escalated a report${about} to admins`
        : meta.reason === 'timeout'
          ? `A report${about} was sent to admins after 72 hours`
          : `A safety report${about} was sent to admins`;
    default:
      return `${actor}: ${event.action.replace(/_/g, ' ')}`;
  }
}
