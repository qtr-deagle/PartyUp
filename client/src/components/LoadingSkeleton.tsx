import React from 'react';

/**
 * Loading Skeleton Component
 * 
 * Design: Minimalist Luxury
 * - Subtle pulse animation
 * - Matches card styling
 * - Improves perceived performance
 */
export default function LoadingSkeleton() {
  return (
    <div className="card-luxury p-6 space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-muted rounded-lg w-3/4 animate-pulse"></div>
          <div className="h-4 bg-muted rounded-lg w-1/2 animate-pulse"></div>
        </div>
        <div className="w-12 h-12 bg-muted rounded-lg animate-pulse shrink-0"></div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="h-4 bg-muted rounded-lg w-full animate-pulse"></div>
        <div className="h-4 bg-muted rounded-lg w-5/6 animate-pulse"></div>
        <div className="h-4 bg-muted rounded-lg w-4/6 animate-pulse"></div>
      </div>

      {/* Footer Skeleton */}
      <div className="flex gap-2 pt-4">
        <div className="flex-1 h-10 bg-muted rounded-lg animate-pulse"></div>
        <div className="flex-1 h-10 bg-muted rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}

/**
 * Grid Loading Skeleton
 * For displaying multiple loading cards
 */
export function LoadingSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingSkeleton key={i} />
      ))}
    </div>
  );
}
