export function FileCardSkeleton() {
  return (
    <div className="p-5 animate-pulse">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface mb-4" />
        <div className="h-4 bg-surface rounded w-20 mb-1" />
        <div className="h-3 bg-surface rounded w-14" />
      </div>
    </div>
  );
}

export function FileListSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-dark-hover">
          <FileCardSkeleton />
        </div>
      ))}
    </div>
  );
}
