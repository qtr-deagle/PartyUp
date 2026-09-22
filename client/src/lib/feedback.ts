import { supabase } from '@/lib/supabase';

export type FeedbackType = 'trip' | 'user' | 'service';

export interface FeedbackRow {
  id: string;
  author_id: string;
  target_user_id: string | null;
  trip_id: string | null;
  rating: number;
  feedback_type: FeedbackType;
  comment: string | null;
  created_at: string;
  updated_at: string;
  author: { display_name: string; avatar_url: string | null } | null;
  target_user: { display_name: string; avatar_url: string | null } | null;
  trip: { title: string } | null;
}

const SELECT_COLUMNS =
  '*, author:profiles!feedback_author_id_fkey(display_name, avatar_url), target_user:profiles!feedback_target_user_id_fkey(display_name, avatar_url), trip:trips(title)';

export async function listFeedback() {
  const { data, error } = await supabase.from('feedback').select(SELECT_COLUMNS).order('created_at', { ascending: false });
  return { data: (data ?? []) as unknown as FeedbackRow[], error };
}
