import { supabase } from '@/lib/supabase';

export type UserVerificationStatus = 'pending' | 'approved' | 'rejected' | 'resubmitted';

export interface UserRow {
  id: string;
  display_name: string;
  email: string | null;
  avatar_url: string | null;
  role: string;
  verification_status: UserVerificationStatus | null;
  created_at: string;
}

const SELECT_COLUMNS = 'id, display_name, email, avatar_url, role, verification_status, created_at';

export async function listUsers(search?: string) {
  let query = supabase.from('profiles').select(SELECT_COLUMNS).order('created_at', { ascending: false });
  const trimmed = search?.trim();
  if (trimmed) {
    query = query.or(`display_name.ilike.%${trimmed}%,email.ilike.%${trimmed}%`);
  }
  const { data, error } = await query;
  return { data: (data ?? []) as unknown as UserRow[], error };
}

export async function setUserVerificationStatus(userId: string, status: 'approved' | 'rejected') {
  const { error } = await supabase.from('profiles').update({ verification_status: status }).eq('id', userId);
  return { error };
}
