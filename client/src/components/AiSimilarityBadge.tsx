import AiCheckingBadge from '@/components/AiCheckingBadge';
import type { AiFlag } from '@/lib/verification';

const AI_FLAG_STYLES: Record<AiFlag, string> = {
  high_confidence: 'bg-green-100 text-green-700',
  needs_review: 'bg-yellow-100 text-yellow-700',
  low_similarity: 'bg-red-100 text-red-700',
  error: 'bg-gray-200 text-gray-600',
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
