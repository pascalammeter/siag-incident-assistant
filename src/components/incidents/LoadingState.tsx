/**
 * Loading State Skeleton Component
 * Shows while incidents are being fetched
 */

'use client';

export function LoadingState() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Loading incidents...</h2>

      {/* Skeleton rows */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 bg-white border border-gray-200 rounded-lg">
            {/* Date skeleton */}
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />

            {/* Type skeleton */}
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />

            {/* Severity skeleton */}
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />

            {/* Title skeleton */}
            <div className="flex-1 h-6 bg-gray-200 rounded animate-pulse" />

            {/* Status skeleton */}
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />

            {/* Actions skeleton */}
            <div className="flex gap-2">
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
