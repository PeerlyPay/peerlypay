'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function OrderCardSkeleton() {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 text-left">
      {/* User info row: address + badge */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>

      {/* Amount */}
      <Skeleton className="mb-1 h-8 w-40" />

      {/* Price */}
      <Skeleton className="mb-2 h-4 w-48" />

      {/* Total */}
      <Skeleton className="h-6 w-36" />

      {/* Payment method */}
      <Skeleton className="mt-3 h-5 w-24 rounded-md" />

      {/* Time limit */}
      <Skeleton className="mt-2 h-3 w-40" />

      {/* Action button */}
      <Skeleton className="mt-4 h-10 w-full rounded-full" />
    </article>
  );
}
