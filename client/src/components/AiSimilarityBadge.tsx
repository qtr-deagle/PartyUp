import AiCheckingBadge from '@/components/AiCheckingBadge';
import type { AiFlag } from '@/lib/verification';

const AI_FLAG_STYLES: Record<AiFlag, string> = {
  high_confidence: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
  needs_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  low_similarity: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
  error: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300',
};

export default function AiSimilarityBadge({
  score,
  flag,
  submittedAt,
}: {
  score: number | null;
  flag: AiFlag | null;
  submittedAt: string;
}) {
  if (!flag) {
    return <AiCheckingBadge submittedAt={submittedAt} label="AI" />;
  }
  const label = flag === 'error' ? 'AI: error' : `AI match: ${Math.round(score ?? 0)}%`;
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-lg whitespace-nowrap ${AI_FLAG_STYLES[flag]}`}>{label}</span>;
}
