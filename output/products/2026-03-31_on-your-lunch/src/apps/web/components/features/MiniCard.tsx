'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart } from '@phosphor-icons/react';
import type { RestaurantMapPin } from '@on-your-lunch/shared-types';

interface MiniCardProps {
  pin: RestaurantMapPin;
  onFavoriteToggle?: () => void;
  onClick?: () => void;
}

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=100&h=100&fit=crop';

function formatPrice(priceRange: string | null): string {
  if (!priceRange) return '';
  switch (priceRange) {
    case 'UNDER_10K':
      return '~1만원';
    case 'BETWEEN_10K_20K':
      return '1~2만원';
    case 'OVER_20K':
      return '2만원~';
    default:
      return '';
  }
}

export default function MiniCard({
  pin,
  onFavoriteToggle,
  onClick,
}: MiniCardProps) {
  const [imgSrc, setImgSrc] = useState(FALLBACK_IMG);

  return (
    <div
      className="flex cursor-pointer items-center gap-3 border-t border-border-default bg-bg-primary px-4 py-3"
      onClick={onClick}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-bg-tertiary">
        <Image
          src={imgSrc}
          alt={pin.name}
          fill
          className="object-cover"
          sizes="64px"
          onError={() => setImgSrc(FALLBACK_IMG)}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-base font-semibold text-text-primary">
          {pin.name}
        </div>
        <div className="mt-0.5 text-[13px] tabular-nums text-text-secondary">
          {pin.categoryName} · 도보 {pin.walkMinutes}분
          {pin.priceRange ? ` · ${formatPrice(pin.priceRange)}` : ''}
        </div>
      </div>
      <button
        className="flex h-11 w-11 items-center justify-center"
        onClick={(e) => {
          e.stopPropagation();
          onFavoriteToggle?.();
        }}
      >
        <Heart
          size={24}
          weight={pin.isFavorite ? 'fill' : 'regular'}
          className={pin.isFavorite ? 'text-primary' : 'text-text-placeholder'}
        />
      </button>
    </div>
  );
}
