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
  trip: { title: string } | null;
}

const SELECT_COLUMNS =
  '*, user:profiles!payment_history_user_id_fkey(display_name), trip:trips(title)';

export async function listPaymentHistory() {
  const { data, error } = await supabase
    .from('payment_history')
    .select(SELECT_COLUMNS)
    .order('created_at', { ascending: false });
  return { data: (data ?? []) as unknown as PaymentHistoryRow[], error };
}
