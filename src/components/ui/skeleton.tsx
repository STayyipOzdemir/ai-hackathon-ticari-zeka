import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...rest }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:400%_100%]",
        className
      )}
      style={{
        animation: "skeleton-shimmer 1.6s ease-in-out infinite",
      }}
      {...rest}
    />
  );
}

export function InsightCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
    </div>
  );
}

export function CategoryHeatSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-2xl" />
      ))}
    </div>
  );
}

export function BudgetTableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-9 rounded-xl" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 rounded-xl" />
      ))}
    </div>
  );
}
