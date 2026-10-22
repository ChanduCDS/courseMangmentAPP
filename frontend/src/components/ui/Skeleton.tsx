export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-secondary-200 ${className}`} />
)
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3 p-4">
    {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
  </div>
)
