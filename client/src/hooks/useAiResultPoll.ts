import { useEffect, useRef } from 'react';
import type { IdVerificationRow } from '@/lib/verification';

const POLL_MS = 4000;
// verify-id-ai finishes in seconds; past this it failed to run, so stop asking.
const GIVE_UP_MS = 3 * 60 * 1000;

// True while a submission is young enough that its AI pre-check may still land.
export function isAiRunning(submittedAt: string) {
  return Date.now() - new Date(submittedAt).getTime() < GIVE_UP_MS;
}

function awaitingAi(row: IdVerificationRow) {
  return row.status === 'pending' && !row.ai_processed_at && isAiRunning(row.submitted_at);
}

// Safety net under useTableRealtime: while a fresh submission is still waiting
// on its AI pre-check, quietly refetch until the result lands, so "AI: pending"
// never needs a manual reload even if the realtime socket missed the update.
export function useAiResultPoll(rows: IdVerificationRow[] | null, reload: () => void) {
  const reloadRef = useRef(reload);
  reloadRef.current = reload;
  const waiting = (rows ?? []).some(awaitingAi);

  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(() => reloadRef.current(), POLL_MS);
    return () => clearInterval(timer);
  }, [waiting]);
}
