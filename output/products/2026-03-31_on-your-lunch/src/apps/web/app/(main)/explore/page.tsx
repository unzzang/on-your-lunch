'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlass,
  Heart,
  List,
  MapTrifold,
  CaretDown,
} from '@phosphor-icons/react';
import { Chip, EmptyState, ErrorState } from '@/components/ui';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import KakaoMap from '@/components/features/KakaoMap';
import MiniCard from '@/components/features/MiniCard';
import RestaurantList from '@/components/features/RestaurantList';
import { useCategories } from '@/hooks/useCategories';
import { useRestaurants, useRestaurantMapPins } from '@/hooks/useRestaurants';
import { useToggleFavorite } from '@/hooks/useMutations';
import { useMe } from '@/hooks/useMe';
import type { RestaurantMapPin } from '@on-your-lunch/shared-types';

type ViewMode = 'map' | 'list';
type SortBy = 'distance' | 'rating';

export default function ExplorePage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('distance');
  const [selectedPin, setSelectedPin] = useState<RestaurantMapPin | null>(null);

  const { data: categories } = useCategories();
  const { data: me } = useMe();

  const {
    data: restaurantData,
    isLoading: listLoading,
    isError: listError,
    refetch: refetchList,
  } = useRestaurants({
    categoryId: selectedCategory,
    sort: sortBy,
    favoriteOnly,
    limit: 50,
  });

  const {
    data: mapPins,
    isLoading: mapLoading,
    isError: mapError,
    refetch: refetchMap,
  } = useRestaurantMapPins({ categoryId: selectedCategory });

  const toggleFav = useToggleFavorite();

  const handlePinClick = useCallback((pin: RestaurantMapPin) => {
    setSelectedPin(pin);
  }, []);

  const handleFavoriteToggle = useCallback(
    (restaurantId: string, isFavorite: boolean) => {
      toggleFav.mutate({ restaurantId, isFavorite });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toggleFav.mutate],
  );

  const sortLabel: Record<SortBy, string> = {
    distance: '거리순',
    rating: '평점순',
  };

  const cycleSortBy = () => {
    const order: SortBy[] = ['distance', 'rating'];
    const idx = order.indexOf(sortBy);
    setSortBy(order[(idx + 1) % order.length]);
  };

  const isLoading = viewMode === 'map' ? mapLoading : listLoading;
  const isError = viewMode === 'map' ? mapError : listError;
  const items = restaurantData?.items ?? [];
  const pins = mapPins ?? [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* 검색 바 */}
      <div className="bg-bg-primary px-4 pb-3">
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-transparent bg-bg-tertiary px-4 py-2.5">
          <MagnifyingGlass size={20} className="text-text-placeholder" />
          <span className="text-[15px] leading-tight text-text-placeholder">
            식당명, 메뉴 검색
          </span>
        </div>
      </div>

      {/* 필터 칩 */}
      <div className="scrollbar-none flex gap-2 overflow-x-auto bg-bg-primary px-4 pb-3">
        <Chip
          active={!selectedCategory && !favoriteOnly}
          onClick={() => {
            setSelectedCategory(null);
            setFavoriteOnly(false);
          }}
        >
          전체
        </Chip>
        {categories?.map((cat) => (
          <Chip
            key={cat.id}
            active={selectedCategory === cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setFavoriteOnly(false);
            }}
          >
            {cat.name}
          </Chip>
        ))}
        <Chip
          active={favoriteOnly}
          icon={<Heart size={16} />}
          onClick={() => {
            setFavoriteOnly(!favoriteOnly);
            setSelectedCategory(null);
          }}
        >
          즐겨찾기
        </Chip>
      </div>

      {/* 정렬 (리스트뷰만) */}
      {viewMode === 'list' && (
        <div className="flex justify-end bg-bg-primary px-4 pb-2 pt-1">
          <button
            className="flex items-center gap-1 text-[13px] text-text-secondary"
            onClick={cycleSortBy}
          >
            {sortLabel[sortBy]} <CaretDown size={16} />
          </button>
        </div>
      )}

      {/* 콘텐츠 */}
      <div className="relative flex-1 overflow-y-auto">
        {isError ? (
          <ErrorState
            onRetry={() => {
              refetchList();
              refetchMap();
            }}
          />
        ) : isLoading ? (
          <div className="flex flex-col">
            {[...Array(4)].map((_, i) => (
              <ListItemSkeleton key={i} />
            ))}
          </div>
        ) : viewMode === 'map' ? (
          /* 지도뷰 */
          <div className="flex h-full flex-col">
            {/* 지도 영역 — flex:1로 남은 공간 채우기, 최소 360px */}
            <div className="relative min-h-[360px] flex-1 shrink-0">
              <div className="absolute inset-0">
                <KakaoMap
                  pins={pins}
                  companyLatitude={me?.location?.latitude}
                  companyLongitude={me?.location?.longitude}
                  onPinClick={handlePinClick}
                />
              </div>
              {/* 뷰 전환 버튼 */}
              <button
                className="absolute bottom-4 right-4 z-[5] flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-full)] border border-border-default bg-bg-primary px-4 py-2.5 text-[13px] font-medium text-text-primary shadow-md"
                onClick={() => setViewMode('list')}
              >
                <List size={18} /> 목록
              </button>
            </div>
            {/* 미니카드 (선택된 핀) */}
            {selectedPin && (
              <MiniCard
                pin={selectedPin}
                onClick={() =>
                  router.push(`/restaurant/${selectedPin.id}`)
                }
                onFavoriteToggle={() =>
                  handleFavoriteToggle(
                    selectedPin.id,
                    selectedPin.isFavorite,
                  )
                }
              />
            )}
            {/* 하단 식당 리스트 */}
            {items.length > 0 && (
              <RestaurantList
                items={items}
                onItemClick={(id) => router.push(`/restaurant/${id}`)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            )}
          </div>
        ) : items.length === 0 ? (
          /* 빈 상태 */
          favoriteOnly ? (
            <EmptyState
              icon={<Heart size={48} />}
              title="즐겨찾기한 식당이 없어요"
              subtitle="마음에 드는 식당에 하트를 눌러보세요"
            />
          ) : (
            <EmptyState
              icon="🍽"
              title="조건에 맞는 식당이 없어요"
              actionLabel="필터 초기화"
              onAction={() => {
                setSelectedCategory(null);
                setFavoriteOnly(false);
              }}
            />
          )
        ) : (
          /* 리스트뷰 */
          <div className="relative">
            <RestaurantList
              items={items}
              onItemClick={(id) => router.push(`/restaurant/${id}`)}
              onFavoriteToggle={handleFavoriteToggle}
            />
            {/* 뷰 전환 버튼 */}
            <div className="sticky bottom-4 flex justify-end px-4 pointer-events-none">
              <button
                className="pointer-events-auto flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-full)] border border-border-default bg-bg-primary px-4 py-2.5 text-[13px] font-medium text-text-primary shadow-md"
                onClick={() => setViewMode('map')}
              >
                <MapTrifold size={18} /> 지도
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
