import React from 'react';
import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * Rating Display Component
 * 
 * Design: Minimalist Luxury
 * - Star rating visualization
 * - Optional review count
 * - Multiple size options
 */
export default function RatingDisplay({
  rating,
  reviewCount,
  size = 'md',
  showLabel = true,
}: RatingDisplayProps) {
  const sizeMap = {
    sm: { star: 'w-3 h-3', text: 'text-xs' },
    md: { star: 'w-4 h-4', text: 'text-sm' },
    lg: { star: 'w-5 h-5', text: 'text-base' },
  };

  const { star, text } = sizeMap[size];

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${star} ${
              i < Math.floor(rating)
                ? 'text-yellow-500 fill-yellow-500'
                : i < rating
                ? 'text-yellow-500 fill-yellow-500 opacity-50'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {showLabel && (
        <span className={`${text} font-medium text-foreground ml-1`}>
          {rating.toFixed(1)}
          {reviewCount && <span className="text-muted-foreground ml-1">({reviewCount})</span>}
        </span>
      )}
    </div>
  );
}
