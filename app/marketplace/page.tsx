import { Suspense } from 'react';
import MarketplaceContent from './MarketplaceContent';

// Loading fallback component
function MarketplaceLoading() {
  return (
    <>
      <div className="h-8 w-40 bg-gray-200 rounded-lg mb-6 animate-pulse" />
      <div className="flex border-b border-gray-200 mb-4">
        <div className="flex-1 py-3 flex justify-center">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex-1 py-3 flex justify-center">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<MarketplaceLoading />}>
      <MarketplaceContent />
    </Suspense>
  );
}
