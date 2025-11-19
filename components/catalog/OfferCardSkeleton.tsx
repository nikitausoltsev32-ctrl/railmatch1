export function OfferCardSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-neutral-200">
        <div className="flex-1">
          <div className="h-5 bg-neutral-200 rounded w-32 mb-2" />
          <div className="h-4 bg-neutral-200 rounded w-48" />
        </div>
        <div className="w-32">
          <div className="h-4 bg-neutral-200 rounded w-full mb-2" />
          <div className="h-4 bg-neutral-200 rounded w-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-neutral-200">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="h-3 bg-neutral-200 rounded w-16 mb-2" />
            <div className="h-4 bg-neutral-200 rounded w-24" />
          </div>
        ))}
      </div>

      <div className="mb-4 pb-4 border-b border-neutral-200">
        <div className="h-3 bg-neutral-200 rounded w-20 mb-2" />
        <div className="h-4 bg-neutral-200 rounded w-40" />
      </div>

      <div className="flex gap-2">
        <div className="h-9 bg-neutral-200 rounded flex-1" />
        <div className="h-9 bg-neutral-200 rounded flex-1" />
      </div>
    </div>
  );
}
