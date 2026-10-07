import { supabase } from '@/lib/supabase';
import { logAuditAction } from '@/lib/auditLog';

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
  ownership_type: 'owned' | 'borrowed';
  authorization_letter_path: string | null;
  owner_id_front_path: string | null;
  owner_id_back_path: string | null;
  owner_signatures_path: string | null;
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
  if (!error) {
    logAuditAction(decision === 'approved' ? 'Approved vehicle verification' : 'Rejected vehicle verification', 'vehicle', vehicleId, {
      notes,
    });
  }
  return { error };
}

// ---------------------------------------------------------------------------
// Driver's licenses (public.driver_licenses, partyup-mobile migrations
// 202610030010 / 202610030012 / 202610070007). One per traveler. Approving or
// rejecting a vehicle also decides that traveler's pending license; a license
// submitted on its own ("license only") is reviewed with reviewDriverLicense.
// ---------------------------------------------------------------------------

export type LicenseAiFlag = 'passed' | 'needs_review' | 'mismatch' | 'error';

export interface DriverLicense {
  user_id: string;
  // 'id_verification' = reused from the traveler's verified ID (photos live in
  // the id-verifications bucket); 'upload' = photographed for this.
  source: 'id_verification' | 'upload';
  front_image_path: string;
  back_image_path: string | null;
  status: 'pending' | 'approved' | 'rejected';
  expiry_date: string | null;
  restriction_codes: string[];
  ai_name_match: boolean | null;
  // QR on the back, read live by the app, vs the printed card and the name.
  qr_data: string | null;
  license_number: string | null;
  ai_qr_match: boolean | null;
  ai_flag: LicenseAiFlag | null;
  ai_error: string | null;
  ai_checked_at: string | null;
  reviewer_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  profiles: { display_name: string; email: string | null } | null;
}

const LICENSE_COLUMNS = '*, profiles!driver_licenses_user_id_fkey(display_name, email)';

export async function getDriverLicenseFor(userId: string) {
  const { data, error } = await supabase.from('driver_licenses').select(LICENSE_COLUMNS).eq('user_id', userId).maybeSingle();
  return { data: (data ?? null) as unknown as DriverLicense | null, error };
}

// Pending licenses with no pending vehicle to review them with: these only
// get decided here.
export async function listLicenseOnlyQueue() {
  const [licenses, vehicles] = await Promise.all([
    supabase.from('driver_licenses').select(LICENSE_COLUMNS).eq('status', 'pending').order('submitted_at', { ascending: true }),
    supabase.from('vehicles').select('user_id').eq('verification_status', 'pending'),
  ]);
  const withVehicle = new Set((vehicles.data ?? []).map((v: { user_id: string }) => v.user_id));
  const rows = ((licenses.data ?? []) as unknown as DriverLicense[]).filter((l) => !withVehicle.has(l.user_id));
  return { data: rows, error: licenses.error ?? vehicles.error };
}

export async function getDriverLicensePhotoUrl(license: Pick<DriverLicense, 'source'>, path: string | null) {
  if (!path) return null;
  const bucket = license.source === 'id_verification' ? 'id-verifications' : 'vehicle-verifications';
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 300);
  return error ? null : data.signedUrl;
}

export async function reviewDriverLicense(userId: string, decision: 'approved' | 'rejected', notes: string) {
  const { error } = await supabase.rpc('review_driver_license', { p_user_id: userId, p_decision: decision, p_notes: notes });
  if (!error) {
    logAuditAction(decision === 'approved' ? "Approved driver's license" : "Rejected driver's license", 'driver_license', userId, { notes });
  }
  return { error };
}
