'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  CaretLeft,
  ShareNetwork,
  Heart,
  MapPin,
  CurrencyKrw,
  Clock,
  Phone,
  MapTrifold,
  ForkKnife,
  PencilSimple,
  Star,
} from '@phosphor-icons/react';
import { BottomSheet, ErrorState } from '@/components/ui';
import Skeleton from '@/components/ui/Skeleton';
import { useRestaurant } from '@/hooks/useRestaurant';
import {
  useToggleFavorite,
  useCreateEatingHistory,
  useUpdateEatingHistory,
  useTrackEvent,
} from '@/hooks/useMutations';
import { useEatingHistory } from '@/hooks/useEatingHistory';
import { useShareRestaurant } from '@/hooks/useShareRestaurant';
import { useKakaoMaps } from '@/hooks/useKakaoMaps';

const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&h=300&fit=crop';

function formatPrice(priceRange: string | null): string {
  if (!priceRange) return '';
  switch (priceRange) {
    case 'UNDER_10K': return '8,000~10,000원';
    case 'BETWEEN_10K_20K': return '10,000~20,000원';
    case 'OVER_20K': return '20,000원~';
    default: return '';
  }
}

function renderStarButtons(
  rating: number,
  onChange: (r: number) => void,
) {
  return (
    <div className="mb-4 flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          className="text-[32px]"
          onClick={() => onChange(n)}
        >
          <Star
            size={32}
            weight="fill"
            className={n <= rating ? 'text-rating' : 'text-border-default'}
          />
        </button>
      ))}
    </div>
  );
}

export default function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: restaurant, isLoading, isError, refetch } = useRestaurant(id);
  const toggleFav = useToggleFavorite();
  const createHistory = useCreateEatingHistory();
  const updateHistory = useUpdateEatingHistory();
  const shareRestaurant = useShareRestaurant();
  const trackEvent = useTrackEvent();

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const { data: calendarData } = useEatingHistory(now.getFullYear(), now.getMonth() + 1);

  // 오늘 이 식당의 기록 찾기
  const todayRecord = calendarData?.days
    ?.find((d) => d.date === today)
    ?.records?.find((r) => r.restaurant.id === id) ?? null;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [rating, setRating] = useState(4);
  const [memo, setMemo] = useState('');
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [heroSrc, setHeroSrc] = useState<string | null>(null);
  const mapSdkLoaded = useKakaoMaps();
  const mapRef = useRef<HTMLDivElement>(null);

  const heroImages = restaurant?.photos?.length
    ? restaurant.photos.map((p) => p.imageUrl)
    : [FALLBACK_HERO];

  const openSheet = () => {
    if (todayRecord) {
      setRating(todayRecord.rating);
      setMemo(todayRecord.memo || '');
    } else {
      setRating(0);
      setMemo('');
    }
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!restaurant) return;
    if (todayRecord) {
      // 수정
      await updateHistory.mutateAsync({
        id: todayRecord.id,
        rating,
        memo: memo || undefined,
      });
      trackEvent.mutate({ eventName: 'eating_history_updated' });
    } else {
      // 신규
      await createHistory.mutateAsync({
        restaurantId: restaurant.id,
        eatenDate: today,
        rating,
        memo: memo || undefined,
        isFromRecommendation: false,
      });
      trackEvent.mutate({ eventName: 'eating_history_created' });
    }
    setSheetOpen(false);
    setRating(4);
    setMemo('');
  };

  /* 식당 상세 페이지 진입 이벤트 */
  useEffect(() => {
    if (restaurant) {
      trackEvent.mutate({
        eventName: 'restaurant_view',
        eventData: { restaurantId: restaurant.id },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant?.id]);

  /* 카카오맵 초기화 */
  useEffect(() => {
    if (!mapSdkLoaded || !mapRef.current || !restaurant) return;

    const pos = new window.kakao.maps.LatLng(
      restaurant.latitude,
      restaurant.longitude,
    );
    const map = new window.kakao.maps.Map(mapRef.current, {
      center: pos,
      level: 3,
    });

    // 식당 마커 (CustomOverlay)
    const markerEl = document.createElement('div');
    markerEl.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="width:32px;height:32px;border-radius:9999px;background:${restaurant.category?.colorCode || '#2563EB'};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
          <svg width="16" height="16" viewBox="0 0 256 256" fill="white"><path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80,132.17,83.41,134.55a8,8,0,0,0,9.18,0C136,236.17,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,56a32,32,0,1,1-32,32A32,32,0,0,1,128,72Z"/></svg>
        </div>
        <span style="font-size:11px;font-weight:600;color:#111827;margin-top:2px;background:white;padding:2px 6px;border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,0.05);white-space:nowrap;">${restaurant.name}</span>
      </div>
    `;
    new window.kakao.maps.CustomOverlay({
      position: pos,
      content: markerEl,
      yAnchor: 1,
      map,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapSdkLoaded, restaurant?.id]);

  const hasTodayRecord = !!todayRecord;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col bg-bg-primary">
        <Skeleton className="h-[280px] w-full !rounded-none" />
        <div className="p-4">
          <Skeleton className="mb-3 h-7 w-[60%]" />
          <Skeleton className="mb-6 h-4 w-[40%]" />
          <Skeleton className="mb-3 h-4 w-[80%]" />
          <Skeleton className="mb-3 h-4 w-[60%]" />
          <Skeleton className="mb-6 h-4 w-[50%]" />
          <Skeleton className="mb-4 h-[100px] w-full !rounded-[var(--radius-lg)]" />
          <Skeleton className="h-40 w-full !rounded-[var(--radius-lg)]" />
        </div>
      </div>
    );
  }

  if (isError || !restaurant) {
    return (
      <div className="flex flex-1 flex-col bg-bg-primary">
        <div className="flex h-14 items-center px-4">
          <button onClick={() => router.back()}>
            <CaretLeft size={24} className="text-text-primary" />
          </button>
        </div>
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-bg-primary">
      {/* 히어로 이미지 */}
      <div className="relative h-[280px] shrink-0 overflow-hidden bg-bg-tertiary">
        <Image
          src={heroSrc || heroImages[currentImageIdx] || FALLBACK_HERO}
          alt={restaurant.name}
          fill
          className="object-cover"
          sizes="393px"
          priority
          onError={() => setHeroSrc(FALLBACK_HERO)}
        />
        {/* 그라데이션 오버레이 */}
        <div
          className="absolute left-0 right-0 top-0 h-[100px]"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)',
          }}
        />
        {/* 상단 네비게이션 */}
        <div className="absolute left-0 right-0 top-[44px] z-10 flex justify-between px-4">
          <button
            className="flex h-11 w-11 items-center justify-center"
            onClick={() => router.back()}
          >
            <CaretLeft size={24} className="text-text-inverse" />
          </button>
          <button
            className="flex h-11 w-11 items-center justify-center"
            onClick={() => shareRestaurant.mutate(id)}
          >
            <ShareNetwork size={24} className="text-text-inverse" />
          </button>
        </div>
        {/* 이미지 인디케이터 — 2장 이상일 때만 표시 */}
        {heroImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {heroImages.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i === currentImageIdx
                    ? 'bg-white'
                    : 'bg-white/50'
                }`}
                onClick={() => setCurrentImageIdx(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 스크롤 콘텐츠 */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* 헤더 */}
        <div className="px-4 pt-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-text-primary">
              {restaurant.name}
            </h1>
            <button
              className="flex h-11 w-11 items-center justify-center"
              onClick={() =>
                toggleFav.mutate({
                  restaurantId: restaurant.id,
                  isFavorite: restaurant.isFavorite,
                })
              }
            >
              <Heart
                size={28}
                weight={restaurant.isFavorite ? 'fill' : 'regular'}
                className="text-primary"
              />
            </button>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            {restaurant.category.name}
            {restaurant.description ? ` · ${restaurant.description}` : ''}
          </p>
        </div>

        {/* 정보 리스트 */}
        <div className="flex flex-col gap-3 px-4 py-4">
          <div className="flex items-center gap-3 text-[15px] text-text-primary">
            <MapPin size={20} className="shrink-0 text-text-secondary" />
            <span className="tabular-nums">
              도보 {restaurant.walkMinutes}분 · {restaurant.address}
            </span>
          </div>
          {restaurant.priceRange && (
            <div className="flex items-center gap-3 text-[15px] text-text-primary">
              <CurrencyKrw
                size={20}
                className="shrink-0 text-text-secondary"
              />
              <span className="tabular-nums">
                {formatPrice(restaurant.priceRange)}
              </span>
            </div>
          )}
          {restaurant.businessHours && (
            <div className="flex items-center gap-3 text-[15px] text-text-primary">
              <Clock size={20} className="shrink-0 text-text-secondary" />
              <span>{restaurant.businessHours}</span>
            </div>
          )}
          {restaurant.phone && (
            <div className="flex cursor-pointer items-center gap-3 text-[15px] text-primary">
              <Phone size={20} className="shrink-0 text-text-secondary" />
              <span>{restaurant.phone}</span>
            </div>
          )}
        </div>

        {/* 내 기록 */}
        {restaurant.myVisit && (
          <div className="mx-4 rounded-[var(--radius-lg)] border border-border-default bg-bg-secondary p-4">
            <div className="mb-2.5 text-[11px] font-medium tracking-wide text-text-secondary">
              내 기록
            </div>
            <div className="text-base font-semibold text-text-primary">
              <Star
                size={16}
                weight="fill"
                className="inline text-rating"
              />{' '}
              {restaurant.myVisit.rating.toFixed(1)} ·{' '}
              {restaurant.myVisit.visitCount}번 방문
            </div>
            {restaurant.myVisit.lastDate && (
              <div className="mt-1.5 text-[13px] leading-[18px] text-text-secondary">
                최근: {restaurant.myVisit.lastDate}
              </div>
            )}
          </div>
        )}

        {/* 지도 프리뷰 */}
        <div className="mx-4 mt-4 h-40 overflow-hidden rounded-[var(--radius-lg)] border border-border-default">
          <div ref={mapRef} className="h-full w-full">
            {!mapSdkLoaded && (
              <div className="flex h-full flex-col items-center justify-center gap-2 bg-bg-tertiary">
                <MapTrifold size={32} className="text-text-placeholder" />
                <span className="text-[13px] text-text-placeholder">
                  지도를 불러오는 중...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-2 border-t border-border-default bg-bg-primary px-4 pb-8 pt-3">
        <button className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border-default text-[15px] font-semibold text-text-primary hover:bg-bg-tertiary">
          <MapTrifold size={20} />
          길찾기
        </button>
        <button
          className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] text-[15px] font-semibold ${
            hasTodayRecord
              ? 'border border-border-default bg-bg-primary text-text-primary hover:bg-bg-tertiary'
              : 'bg-primary text-text-inverse hover:bg-primary-hover'
          }`}
          onClick={openSheet}
        >
          {hasTodayRecord ? (
            <>
              <PencilSimple size={20} />
              기록 수정
            </>
          ) : (
            <>
              <ForkKnife size={20} />
              먹었어요
            </>
          )}
        </button>
      </div>

      {/* 먹었어요 바텀시트 */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={`${restaurant.name}에서 먹었군요!`}
      >
        <p className="mb-3 text-sm text-text-secondary">
          별점을 남겨주세요
        </p>
        {renderStarButtons(rating, setRating)}

        <p className="mb-2 text-sm text-text-secondary">한줄 메모 (선택)</p>
        <textarea
          className="h-20 w-full resize-none rounded-[var(--radius-md)] border border-border-default px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-placeholder focus:border-primary"
          placeholder="오늘 된장찌개가 맛있었어요"
          maxLength={300}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
        <p className="mt-1 text-right text-xs text-text-placeholder">
          {memo.length}/300자
        </p>
        <button
          className="mt-4 h-12 w-full rounded-[var(--radius-md)] bg-primary text-base font-semibold text-text-inverse disabled:bg-primary-disabled"
          disabled={createHistory.isPending || updateHistory.isPending || rating === 0}
          onClick={handleSave}
        >
          {createHistory.isPending || updateHistory.isPending ? '저장 중...' : '저장하기'}
        </button>
      </BottomSheet>
    </div>
  );
}
