import { supabase } from '@/lib/supabase';

export type DocumentType = 'passport' | 'driver_license' | 'national_id' | 'other';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'resubmitted';
export type AiFlag = 'high_confidence' | 'needs_review' | 'low_similarity' | 'error';

export interface IdVerificationRow {
  id: string;
  user_id: string;
  document_type: DocumentType;
  document_country: string | null;
  document_last4: string | null;
  front_image_path: string | null;
  back_image_path: string | null;
  selfie_image_path: string | null;
  status: VerificationStatus;
  reviewer_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  // Advisory AI pre-check (facial similarity + estimated age range). Never
  // drives status automatically -- staff still makes the final call.
  ai_similarity_score: number | null;
  ai_age_low: number | null;
  ai_age_high: number | null;
  ai_flag: AiFlag | null;
  ai_underage_flag: boolean;
  ai_error: string | null;
  ai_processed_at: string | null;
  profiles: {
    display_name: string;
    email: string | null;
    avatar_url: string | null;
  } | null;
}

const SELECT_COLUMNS = '*, profiles!id_verifications_user_id_fkey(display_name, email, avatar_url)';

export async function listIdVerifications(status?: VerificationStatus) {
  let query = supabase.from('id_verifications').select(SELECT_COLUMNS).order('submitted_at', { ascending: true });
  if (status) {
    query = query.eq('status', status);
  }
  const { data, error } = await query;
  return { data: (data ?? []) as unknown as IdVerificationRow[], error };
}

export async function getSignedImageUrl(path: string | null) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from('id-verifications').createSignedUrl(path, 300);
  if (error) return null;
  return data.signedUrl;
}

export async function reviewIdVerification(verificationId: string, decision: 'approved' | 'rejected', notes: string) {
  const { error } = await supabase.rpc('review_id_verification', {
    p_verification_id: verificationId,
    p_decision: decision,
    p_notes: notes,
  });
  return { error };
}

export async function getMyVerification() {
  const { data, error } = await supabase
    .from('id_verifications')
    .select('*')
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return { data: data as (IdVerificationRow & { profiles: null }) | null, error };
}

export async function submitIdVerificationWeb(input: {
  documentType: DocumentType;
  documentCountry?: string;
  front: File;
  back?: File;
  selfie: File;
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: userError ?? new Error('You must be signed in to submit a verification.') };
  }
  const userId = userData.user.id;

  async function upload(label: 'front' | 'back' | 'selfie', file: File) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${userId}/${Date.now()}-${label}.${extension}`;
    const { error } = await supabase.storage.from('id-verifications').upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(`Failed to upload ${label} image: ${error.message}`);
    return path;
  }

  try {
    const frontPath = await upload('front', input.front);
    const backPath = input.back ? await upload('back', input.back) : null;
    const selfiePath = await upload('selfie', input.selfie);

    const { error: insertError } = await supabase.from('id_verifications').insert({
      user_id: userId,
      submitted_by: userId,
      document_type: input.documentType,
      document_country: input.documentCountry ?? null,
      front_image_path: frontPath,
      back_image_path: backPath,
      selfie_image_path: selfiePath,
      status: 'pending',
    });

    if (insertError) return { error: insertError };
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error('Failed to submit verification.') };
  }
}
