import { supabase } from '@/lib/supabase';

// Backs the staff/admin Payment Monitoring dashboard -- reads the real
// payment_history table (see supabase/migrations/202608080001_partyup_initial_schema.sql
// and 202609150001_add_gateway_payments.sql in partyup-mobile). Rows come from
// two sources: the manual honor-system flow (report_payment/confirm_payment_received
// RPCs, gateway='manual') and the sandbox PayMongo flow (create-gateway-payment /
// paymongo-webhook Edge Functions, gateway='paymongo').

export type PaymentStatus = 'demo' | 'pending' | 'paid' | 'refunded';
export type PaymentGateway = 'manual' | 'paymongo';

export interface PaymentHistoryRow {
  id: string;
  user_id: string;
  trip_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway: PaymentGateway;
  gateway_payment_intent_id: string | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
  user: { display_name: string } | null;
  trip: { title: string; trip_type: 'carpool' | 'tour' } | null;
  trip_member: { platform_fee: number | null } | null;
}

// PartyUp's fee, 2% on every payment. Must match public.carpool_platform_fee_rate()
// and PLATFORM_FEE_RATE / CARPOOL_PLATFORM_FEE_RATE in partyup-mobile lib/carpool.ts.
export const PLATFORM_FEE_RATE = 0.02;

// trip_members has two links to payment_history (this row's trip_member_id,
// and trip_members.last_payment_id), so the embed must name the FK or
// PostgREST rejects the whole query and the table shows empty.
const SELECT_COLUMNS =
  '*, user:profiles!payment_history_user_id_fkey(display_name), trip:trips(title, trip_type), trip_member:trip_members!payment_history_trip_member_id_fkey(platform_fee)';

const roundCents = (value: number) => Math.round(value * 100) / 100;

// What PartyUp earns from one payment. Carpool riders pay their contribution
// plus the fee on top (stored per rider as trip_members.platform_fee), so
// `amount` already includes it. Tour riders pay the listed price and the fee
// comes out of the organizer's share.
export function partyUpFee(row: PaymentHistoryRow) {
  const amount = Number(row.amount);
  if (row.trip?.trip_type === 'carpool') {
    const stored = row.trip_member?.platform_fee;
    return stored != null ? Number(stored) : roundCents(amount - amount / (1 + PLATFORM_FEE_RATE));
  }
  return roundCents(amount * PLATFORM_FEE_RATE);
}

export function formatPeso(value: number) {
  return `₱${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export async function listPaymentHistory() {
  const { data, error } = await supabase
    .from('payment_history')
    .select(SELECT_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) console.error('listPaymentHistory failed:', error.message);
  return { data: (data ?? []) as unknown as PaymentHistoryRow[], error };
}
