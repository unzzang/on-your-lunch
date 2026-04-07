'use client';

import { useState } from 'react';
import { Heart, Star } from '@phosphor-icons/react';
import type { RestaurantListItem } from '@on-your-lunch/shared-types';
import { useToggleFavorite } from '@/hooks';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=200&fit=crop',
];

function getPriceLabel(priceRange: string | null): string {
  switch (priceRange) {
    case 'UNDER_10K':
      return '~1만원';
    case 'BETWEEN_10K_20K':
      return '~1.5만원';
    case 'OVER_20K':
      return '~2만원';
    default:
      return '';
  }
}

interface RestaurantCardProps {
  restaurant: RestaurantListItem;
  index?: number;
  onClick?: () => void;
}

export default function RestaurantCard({
  restaurant,
  index = 0,
  onClick,
}: RestaurantCardProps) {
  const toggleFavorite = useToggleFavorite();

  const imageUrl =
    restaurant.thumbnailUrl ||
    FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

  const [imgSrc, setImgSrc] = useState(imageUrl);

  const priceLabel = getPriceLabel(restaurant.priceRange);

  const metaParts = [
    restaurant.category.name,
    `도보 ${restaurant.walkMinutes}분`,
    priceLabel,
  ].filter(Boolean);

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite.mutate({
      restaurantId: restaurant.id,
      isFavorite: restaurant.isFavorite,
    });
  };

  return (
    <div
      onClick={onClick}
      className="cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border border-border-default bg-bg-primary shadow-sm"
    >
      {/* 이미지 */}
      <div className="h-40 overflow-hidden bg-bg-tertiary">
        {/* eslint-disable-next-line @next/next/no-img-element -- 외부 URL 이미지 (Unsplash 등)로 next/image domains 설정 없이 사용 */}
        <img
          src={imgSrc}
          alt={restaurant.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setImgSrc(FALLBACK_IMAGES[index % FALLBACK_IMAGES.length])}
        />
      </div>

      {/* 본문 */}
      <div className="p-4">
        {/* 헤더: 이름 + 하트 */}
        <div className="flex items-center justify-between">
          <span className="text-[18px] font-semibold text-text-primary">
            {restaurant.name}
          </span>
          <button
            onClick={handleFavClick}
            className="-my-[10px] -mr-[10px] flex h-11 w-11 items-center justify-center border-none bg-transparent"
          >
            <Heart
              size={24}
              weight={restaurant.isFavorite ? 'fill' : 'regular'}
              className={
                restaurant.isFavorite
                  ? 'text-primary transition-all duration-200'
                  : 'text-text-placeholder transition-all duration-200'
              }
            />
          </button>
        </div>

        {/* 메타 정보 */}
        <p className="tabular-nums mt-[6px] text-sm text-text-secondary">
          {metaParts.join(' · ')}
        </p>

        {/* 뱃지 (평점 + 방문 횟수) */}
        {restaurant.myVisit && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-bg-tertiary px-2 py-1 text-xs text-text-secondary">
            <Star size={12} weight="fill" className="text-rating" />
            {restaurant.myVisit.rating.toFixed(1)} · {restaurant.myVisit.visitCount}번 방문
          </div>
        )}
      </div>
    </div>
  );
}
