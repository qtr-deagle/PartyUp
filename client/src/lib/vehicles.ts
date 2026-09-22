import { supabase } from '@/lib/supabase';

export type VehicleVerificationStatus = 'unverified' | 'pending' | 'approved' | 'rejected';

export interface VehicleRow {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number | null;
  color: string | null;
  plate_number: string | null;
  verification_status: VehicleVerificationStatus;
  is_primary: boolean;
  notes: string | null;
  exterior_image_path: string | null;
  orcr_image_path: string | null;
  plate_image_path: string | null;
  reviewer_notes: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    display_name: string;
    email: string | null;
    avatar_url: string | null;
  } | null;
}

const SELECT_COLUMNS = '*, profiles!vehicles_user_id_fkey(display_name, email, avatar_url)';

export async function listVehicles(status?: VehicleVerificationStatus) {
  let query = supabase.from('vehicles').select(SELECT_COLUMNS).order('submitted_at', { ascending: true });
  if (status) {
    query = query.eq('verification_status', status);
  }
  const { data, error } = await query;
  return { data: (data ?? []) as unknown as VehicleRow[], error };
}

export async function getVehiclePhotoUrl(path: string | null) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from('vehicle-verifications').createSignedUrl(path, 300);
  if (error) return null;
  return data.signedUrl;
}

export async function reviewVehicleVerification(vehicleId: string, decision: 'approved' | 'rejected', notes: string) {
  const { error } = await supabase.rpc('review_vehicle_verification', {
    p_vehicle_id: vehicleId,
    p_decision: decision,
    p_notes: notes,
  });
  return { error };
}
