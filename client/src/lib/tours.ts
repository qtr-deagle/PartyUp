import { supabase } from '@/lib/supabase';

// Mirrors partyup-mobile's lib/tours.ts + the tour-relevant slice of
// lib/carpool.ts -- both apps share the same Supabase project/schema, so the
// RPCs (create_trip, list_my_trips, list_browse_trips, etc.) are identical.

export const TOUR_INTEREST_TAGS = [
  'Hiking',
  'Beaches',
  'Museums',
  'Food',
  'Photography',
  'History',
  'Nature',
  'Shopping',
  'Nightlife',
  'Adventure',
  'Art',
  'Relaxation',
] as const;

export type TourInterestTag = (typeof TOUR_INTEREST_TAGS)[number];

export type TripType = 'carpool' | 'tour';
export type TripVisibility = 'public' | 'trusted_circle' | 'private';
export type TripStatus = 'draft' | 'open' | 'full' | 'ongoing' | 'completed' | 'cancelled';
export type MemberRole = 'member' | 'driver' | 'coordinator';
export type MemberStatus = 'pending' | 'accepted' | 'rejected' | 'left';

export interface TourCard {
  id: string;
  title: string;
  origin: string;
  destination: string;
  start_at: string | null;
  end_at: string | null;
  duration_days: number | null;
  status: TripStatus;
  visibility: TripVisibility;
  seats_total: number | null;
  seats_available: number | null;
  rider_count: number;
  total_cost: number | null;
  price_per_person: number | null;
  interest_tags: string[];
  organizer_id: string;
  organizer_display_name: string;
  organizer_avatar_url: string | null;
  organizer_verified: boolean;
  is_favorited: boolean;
  created_at: string;
}

export interface TourDetail {
  id: string;
  title: string;
  origin: string;
  destination: string;
  start_at: string | null;
  end_at: string | null;
  duration_days: number | null;
  status: TripStatus;
  visibility: TripVisibility;
  notes: string | null;
  seats_total: number | null;
  seats_available: number | null;
  rider_count: number;
  price_per_person: number | null;
  total_cost: number | null;
  interest_tags: string[];
  organizer_id: string;
  organizer_display_name: string;
  organizer_avatar_url: string | null;
  organizer_verified: boolean;
  is_creator: boolean;
  my_status: string | null;
  is_favorited: boolean;
}

export interface ItineraryDay {
  id: string;
  day_number: number;
  description: string;
}

export interface MyTrip {
  id: string;
  title: string;
  origin: string;
  destination: string;
  start_at: string | null;
  end_at: string | null;
  duration_days: number | null;
  status: TripStatus;
  visibility: TripVisibility;
  seats_total: number | null;
  seats_available: number | null;
  total_cost: number | null;
  price_per_person: number | null;
  interest_tags: string[];
  rider_count: number;
  my_role: MemberRole;
  my_status: MemberStatus;
  pending_join_requests_count: number;
  organizer_id: string;
  organizer_display_name: string;
  organizer_avatar_url: string | null;
  organizer_verified: boolean;
  is_favorited: boolean;
  created_at: string;
}

export async function listBrowseTours(search?: string, tripType: TripType = 'tour') {
  const { data, error } = await supabase.rpc('list_browse_trips', {
    p_trip_type: tripType,
    p_search: search?.trim() || null,
  });
  return { data: (data ?? []) as TourCard[], error };
}

export async function listFavoriteTours(tripType: TripType = 'tour') {
  const { data, error } = await supabase.rpc('list_favorite_trips', { p_trip_type: tripType });
  return { data: (data ?? []) as TourCard[], error };
}

export async function toggleTripFavorite(tripId: string) {
  const { data, error } = await supabase.rpc('toggle_trip_favorite', { p_trip_id: tripId });
  return { data: (data ?? null) as boolean | null, error };
}

export async function getTourDetail(tripId: string) {
  const { data, error } = await supabase.rpc('get_tour_detail', { p_trip_id: tripId });
  if (error) {
    return { data: null, error };
  }
  const rows = (data ?? []) as TourDetail[];
  return { data: rows[0] ?? null, error: null };
}

export async function listTripItinerary(tripId: string) {
  const { data, error } = await supabase.rpc('list_trip_itinerary', { p_trip_id: tripId });
  return { data: (data ?? []) as ItineraryDay[], error };
}

export async function joinPublicTrip(tripId: string) {
  const { data, error } = await supabase.rpc('join_public_trip', { p_trip_id: tripId });
  if (error) {
    return { data: null, error };
  }
  const rows = (data ?? []) as { trip_id: string; member_status: string }[];
  return { data: rows[0] ?? null, error: null };
}

export async function listMyTrips(tripType: TripType = 'tour') {
  const { data, error } = await supabase.rpc('list_my_trips', { p_trip_type: tripType });
  return { data: (data ?? []) as MyTrip[], error };
}

export async function createTour(input: {
  title: string;
  origin: string;
  destination: string;
  startAt?: string | null;
  seatsTotal?: number | null;
  notes?: string | null;
  pricePerPerson?: number | null;
  durationDays?: number | null;
  interests?: string[];
  itinerary?: { dayNumber: number; description: string }[];
}) {
  return supabase.rpc('create_trip', {
    p_title: input.title,
    p_origin: input.origin,
    p_destination: input.destination,
    p_start_at: input.startAt ?? null,
    p_end_at: null,
    p_visibility: 'public',
    p_seats_total: input.seatsTotal ?? null,
    p_total_cost: null,
    p_notes: input.notes ?? null,
    p_destination_lat: null,
    p_destination_lng: null,
    p_trip_type: 'tour',
    p_price_per_person: input.pricePerPerson ?? null,
    p_duration_days: input.durationDays ?? null,
    p_interests: input.interests ?? [],
    p_itinerary: (input.itinerary ?? []).map((day) => ({ day_number: day.dayNumber, description: day.description })),
  });
}

export async function cancelTrip(tripId: string) {
  return supabase.rpc('cancel_trip', { p_trip_id: tripId });
}

export function formatCurrency(amount: number | null | undefined, currency = 'PHP') {
  if (amount === null || amount === undefined) {
    return '—';
  }
  const symbol = currency === 'PHP' ? '₱' : `${currency} `;
  return `${symbol}${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
