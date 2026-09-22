import { supabase } from '@/lib/supabase';

// Backs the staff/admin Pairing History pages -- see
// supabase/migrations/20260922000000_add_pairing_history_rpc.sql for the
// SECURITY DEFINER RPC this calls (staff/admin gated server-side, matching
// list_active_trips_with_safety_status's convention).

export interface PairingHistoryRow {
  id: string;
  trip_id: string;
  user1_id: string;
  user1_name: string;
  user2_id: string;
  user2_name: string;
  trip_type: 'carpool' | 'tour';
  destination: string;
  start_at: string | null;
  status: 'completed' | 'active';
  compatibility: number;
  rating: number | null;
  rating_count: number;
}

export async function listPairingHistory() {
  const { data, error } = await supabase.rpc('list_pairing_history');
  return { data: (data ?? []) as PairingHistoryRow[], error };
}
