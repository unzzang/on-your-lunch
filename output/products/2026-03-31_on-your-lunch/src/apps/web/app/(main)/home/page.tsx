'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowsClockwise,
  BowlFood,
  WifiSlash,
} from '@phosphor-icons/react';
import AppBar from '@/components/layout/AppBar';
import FilterChips from '@/components/features/FilterChips';
import RestaurantCard from '@/components/features/RestaurantCard';
import { CardSkeleton } from '@/components/ui';
import { useRecommendations, useRefreshRecommendation, useMe, useTrackEvent } from '@/hooks';
import { useFilterStore } from '@/stores/filterStore';
import { useAuthStore } from '@/stores/authStore';

export default function HomePage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  // 미로그인 시 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!accessToken) {
      router.replace('/login');
    }
  }, [accessToken, router]);

  const { selectedCategoryId, walkMinutes, priceRange } = useFilterStore();
  const { data: me } = useMe();
  const {
    data: rawRecommendations,
    isLoading,
    isError,
    refetch,
  } = useRecommendations({
    categoryId: selectedCategoryId,
    walkMinutes,
    priceRange,
  });

  /* 백엔드가 캐시된 추천을 반환할 경우, 클라이언트에서 필터 적용 */
  const recommendations = useMemo(() => {
    if (!rawRecommendations) return rawRecommendations;

    let filtered = rawRecommendations.restaurants;

    // 카테고리 필터
    if (selectedCategoryId) {
      filtered = filtered.filter((r) => r.category.id === selectedCategoryId);
    }

    // 도보 시간 필터 (이하)
    if (walkMinutes) {
      filtered = filtered.filter((r) => r.walkMinutes <= walkMinutes);
    }

    // 가격대 필터 (문자열 매칭)
    if (priceRange) {
      filtered = filtered.filter((r) => r.priceRange === priceRange);
    }

    return { ...rawRecommendations, restaurants: filtered };
  }, [rawRecommendations, selectedCategoryId, walkMinutes, priceRange]);

  const refreshMutation = useRefreshRecommendation();
  const trackEvent = useTrackEvent();

  /* 홈 페이지 진입 이벤트 */
  useEffect(() => {
    if (accessToken) {
      trackEvent.mutate({ eventName: 'page_view', eventData: { page: 'home' } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const handleRefresh = () => {
    if (!recommendations) return;
    if (recommendations.refreshCount >= recommendations.maxRefreshCount) return;

    trackEvent.mutate({ eventName: 'recommendation_refresh' });
    refreshMutation.mutate({
      categoryIds: selectedCategoryId ? [selectedCategoryId] : undefined,
      priceRange: priceRange ?? undefined,
      walkMinutes: walkMinutes ?? undefined,
    });
  };

  const nickname = me?.nickname ?? '회원';
  const exhausted =
    recommendations &&
    recommendations.refreshCount >= recommendations.maxRefreshCount;

  if (!accessToken) return null;

  return (
    <div className="flex flex-1 flex-col">
      {/* 앱바 */}
      <AppBar />

      {/* 인사말 */}
      <div className="bg-bg-primary px-4 py-3">
        <h1 className="text-[24px] font-bold leading-8 text-text-primary">
          {nickname}님,
          <br />
          오늘 점심 뭐 먹을까요?
        </h1>
      </div>

      {/* 필터 */}
      <div className="sticky top-0 z-10">
        <FilterChips />
      </div>
      <div className="h-px bg-border-default" />

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex flex-1 flex-col gap-3 p-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* 에러 상태 */}
      {isError && !isLoading && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-16 text-center">
          <WifiSlash size={48} className="text-text-placeholder" />
          <p className="text-[16px] text-text-secondary">
            인터넷 연결을 확인해주세요
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 rounded-[var(--radius-md)] bg-primary px-6 py-3 text-sm font-semibold text-text-inverse"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 빈 상태 */}
      {!isLoading &&
        !isError &&
        recommendations?.restaurants.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-16 text-center">
            <BowlFood size={48} className="text-text-placeholder" />
            <p className="text-[16px] leading-6 text-text-secondary">
              조건에 맞는 식당을 찾지 못했어요
            </p>
            <p className="text-sm text-text-placeholder">필터를 바꿔보세요</p>
            <button
              onClick={() => useFilterStore.getState().resetFilters()}
              className="mt-2 rounded-[var(--radius-md)] border border-border-default bg-transparent px-5 py-[10px] text-sm font-medium text-text-primary"
            >
              필터 초기화
            </button>
          </div>
        )}

      {/* 정상: 카드 목록 */}
      {!isLoading &&
        !isError &&
        recommendations &&
        recommendations.restaurants.length > 0 && (
          <div className="flex flex-1 flex-col gap-3 p-4">
            {recommendations.restaurants.map((restaurant, idx) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                index={idx}
                onClick={() =>
                  router.push(`/restaurant/${restaurant.id}`)
                }
              />
            ))}

            {/* 새로고침 버튼 */}
            <button
              onClick={handleRefresh}
              disabled={!!exhausted || refreshMutation.isPending}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border-default transition-colors ${
                exhausted
                  ? 'cursor-not-allowed bg-bg-secondary'
                  : 'bg-bg-secondary hover:bg-bg-tertiary'
              }`}
            >
              <ArrowsClockwise
                size={20}
                className={
                  exhausted ? 'text-text-placeholder' : 'text-primary'
                }
              />
              <span
                className={`text-sm font-medium ${
                  exhausted ? 'text-text-placeholder' : 'text-text-secondary'
                }`}
              >
                {exhausted
                  ? '오늘 추천을 모두 확인했어요'
                  : `다른 추천 보기 (${recommendations.refreshCount}/${recommendations.maxRefreshCount})`}
              </span>
            </button>
          </div>
        )}
    </div>
  );
}
