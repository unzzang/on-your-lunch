'use client';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[var(--radius-sm)] bg-bg-tertiary ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}

/** 카드 형태 스켈레톤 (홈 화면용) */
export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border-default bg-bg-primary">
      <Skeleton className="h-40 !rounded-none" />
      <div className="p-4">
        <Skeleton className="mb-2 h-[18px] w-[85%]" />
        <Skeleton className="h-[18px] w-[60%]" />
      </div>
    </div>
  );
}

/** 리스트 아이템 스켈레톤 (탐색 화면용) */
export function ListItemSkeleton() {
  return (
    <div className="flex gap-3 border-b border-border-default p-4">
      <Skeleton className="h-20 w-20 shrink-0 !rounded-[var(--radius-md)]" />
      <div className="flex flex-1 flex-col justify-center gap-2">
        <Skeleton className="h-4 w-[60%]" />
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-[40%]" />
      </div>
    </div>
  );
}
