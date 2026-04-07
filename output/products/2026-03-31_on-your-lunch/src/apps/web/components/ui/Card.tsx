'use client';

import Image from 'next/image';
import { Heart } from '@phosphor-icons/react';

interface CardProps {
  name: string;
  category: string;
  walkMinutes: number;
  priceRange: string;
  imageUrl?: string;
  rating?: number;
  visitCount?: number;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  onClick?: () => void;
}

export default function Card({
  name,
  category,
  walkMinutes,
  priceRange,
  imageUrl,
  rating,
  visitCount,
  isFavorite = false,
  onFavoriteToggle,
  onClick,
}: CardProps) {
  return (
    <div
      className="cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border border-border-default bg-bg-primary shadow-sm"
      onClick={onClick}
    >
      {/* 이미지 */}
      <div className="relative h-40 bg-bg-tertiary">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <span className="text-5xl text-text-placeholder">🍽</span>
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-text-primary">
            {name}
          </span>
          <button
            className="flex h-11 w-11 items-center justify-center -mr-2.5"
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle?.();
            }}
          >
            <Heart
              size={24}
              weight={isFavorite ? 'fill' : 'regular'}
              className={
                isFavorite ? 'text-primary' : 'text-text-placeholder'
              }
            />
          </button>
        </div>

        <p className="mt-1.5 text-sm tabular-nums text-text-secondary">
          {category} · 도보 {walkMinutes}분 · {priceRange}
        </p>

        {(rating !== undefined || visitCount !== undefined) && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-bg-tertiary px-2 py-1 text-xs text-text-secondary">
            {rating !== undefined && <>★ {rating}</>}
            {visitCount !== undefined && <> · {visitCount}번 방문</>}
          </div>
        )}
      </div>
    </div>
  );
}
