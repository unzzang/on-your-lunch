'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, Star } from '@phosphor-icons/react';
import type { RestaurantListItem } from '@on-your-lunch/shared-types';

interface RestaurantListProps {
  items: RestaurantListItem[];
  onItemClick?: (id: string) => void;
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&h=100&fit=crop',
];

function formatPrice(priceRange: string | null): string {
  if (!priceRange) return '';
  switch (priceRange) {
    case 'UNDER_10K': return '~1만원';
    case 'BETWEEN_10K_20K': return '1~2만원';
    case 'OVER_20K': return '2만원~';
    default: return '';
  }
}

const GENERIC_FALLBACK =
  'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&h=300&fit=crop';

function RestaurantListThumbnail({ item, idx }: { item: RestaurantListItem; idx: number }) {
  const initialSrc = item.thumbnailUrl || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
  const [src, setSrc] = useState(initialSrc);

  return (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-bg-tertiary">
      <Image
        src={src}
        alt={item.name}
        fill
        className="object-cover"
        sizes="80px"
        onError={() => setSrc(GENERIC_FALLBACK)}
      />
    </div>
  );
}

export default function RestaurantList({
  items,
  onItemClick,
  onFavoriteToggle,
}: RestaurantListProps) {
  return (
    <div className="flex flex-col">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={`flex cursor-pointer gap-3 border-b border-border-default px-4 py-3 hover:bg-bg-secondary ${
            item.isClosed ? 'opacity-50' : ''
          }`}
          onClick={() => onItemClick?.(item.id)}
        >
          {/* 썸네일 */}
          <RestaurantListThumbnail item={item} idx={idx} />

          {/* 정보 */}
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <div className="text-base font-semibold text-text-primary">
              {item.name}
              {item.isClosed && (
                <span className="ml-1.5 inline-block rounded-[var(--radius-sm)] bg-bg-tertiary px-1.5 py-0.5 text-[11px] font-medium text-text-placeholder">
                  폐업
                </span>
              )}
            </div>
            <div className="mt-[3px] text-[13px] tabular-nums text-text-secondary">
              {item.category.name} · 도보 {item.walkMinutes}분
              {item.priceRange ? ` · ${formatPrice(item.priceRange)}` : ''}
            </div>
            {item.myVisit && (
              <div className="mt-0.5 text-[13px] text-text-secondary">
                <Star size={13} weight="fill" className="inline text-rating" />{' '}
                {item.myVisit.rating.toFixed(1)} ({item.myVisit.visitCount}회)
              </div>
            )}
          </div>

          {/* 즐겨찾기 */}
          <button
            className="flex h-11 w-11 shrink-0 items-center justify-center self-center"
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle?.(item.id, item.isFavorite);
            }}
          >
            <Heart
              size={24}
              weight={item.isFavorite ? 'fill' : 'regular'}
              className={
                item.isFavorite ? 'text-primary' : 'text-text-placeholder'
              }
            />
          </button>
        </div>
      ))}
    </div>
  );
}
