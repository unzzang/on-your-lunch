import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PriceRange } from '@prisma/client';

// Haversine 공식 (restaurant.service.ts와 동일)
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceToWalkMinutes(distanceMeters: number): number {
  return Math.round((distanceMeters * 1.3) / 80);
}

/** 도보 N분 → 직선 거리(m) 환산 */
function walkMinutesToMaxDistance(minutes: number): number {
  return (minutes * 80) / 1.3;
}

const MAX_REFRESH = 5;

@Injectable()
export class RecommendationService {
  constructor(private prisma: PrismaService) {}

  /**
   * GET /recommendations/today — 오늘의 추천 조회
   * 필터 파라미터가 없으면 사용자 기본 설정을 적용한다.
   */
  async getToday(
    userId: string,
    categoryIdsParam: string | undefined,
    priceRangeParam: string | undefined,
    walkMinutesParam: number | undefined,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        location: true,
        preferredCategories: true,
        excludedCategories: true,
      },
    });

    if (!user || !user.location) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '먼저 회사 위치를 설정해주세요.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 필터 결정 (파라미터 우선, 없으면 사용자 설정)
    let filterCategoryIds: string[] | null = null;
    if (categoryIdsParam === 'all') {
      filterCategoryIds = null; // 전체
    } else if (categoryIdsParam) {
      filterCategoryIds = categoryIdsParam.split(',');
    } else {
      // 사용자 선호 카테고리 (없으면 전체)
      const preferred = user.preferredCategories.map((pc) => pc.categoryId);
      filterCategoryIds = preferred.length > 0 ? preferred : null;
    }

    const filterPriceRange = priceRangeParam ?? user.preferredPriceRange;
    const filterWalkMinutes = walkMinutesParam ?? 10;

    // 오늘 추천 기록 조회 (새로고침 횟수)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLog = await this.prisma.recommendationLog.findFirst({
      where: {
        userId,
        recommendationDate: today,
      },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    const refreshCount = todayLog?.refreshCount ?? 0;

    // 추천 알고리즘 실행
    const restaurants = await this.runRecommendation(
      userId,
      user.location,
      filterCategoryIds,
      filterPriceRange as PriceRange | null,
      filterWalkMinutes,
      user.excludedCategories.map((ec) => ec.categoryId),
    );

    // 즐겨찾기 + 방문이력 추가
    const enriched = await this.enrichRestaurants(restaurants, userId);

    return {
      restaurants: enriched,
      refreshCount,
      maxRefreshCount: MAX_REFRESH,
      filterApplied: {
        categoryIds: filterCategoryIds,
        priceRange: filterPriceRange,
        walkMinutes: filterWalkMinutes,
      },
    };
  }

  /** POST /recommendations/today/refresh — 추천 새로고침 */
  async refresh(
    userId: string,
    categoryIds: string[] | undefined,
    priceRange: string | undefined,
    walkMinutes: number | undefined,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 오늘의 마지막 추천 로그 조회
    const latestLog = await this.prisma.recommendationLog.findFirst({
      where: { userId, recommendationDate: today },
      orderBy: { createdAt: 'desc' },
    });

    const currentRefresh = latestLog?.refreshCount ?? 0;

    if (currentRefresh >= MAX_REFRESH) {
      throw new HttpException(
        {
          code: 'REFRESH_LIMIT_EXCEEDED',
          message: '오늘 추천을 모두 사용했어요. 식당 탐색에서 직접 찾아보세요!',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 사용자 정보 조회
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        location: true,
        preferredCategories: true,
        excludedCategories: true,
      },
    });

    if (!user || !user.location) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '먼저 회사 위치를 설정해주세요.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 필터 결정
    let filterCategoryIds: string[] | null = null;
    if (categoryIds && categoryIds.length > 0) {
      if (categoryIds.includes('all')) {
        filterCategoryIds = null;
      } else {
        filterCategoryIds = categoryIds;
      }
    } else {
      const preferred = user.preferredCategories.map((pc) => pc.categoryId);
      filterCategoryIds = preferred.length > 0 ? preferred : null;
    }

    const filterPriceRange = (priceRange ?? user.preferredPriceRange) as PriceRange | null;
    const filterWalkMinutes = walkMinutes ?? 10;

    // 이전 추천된 식당 ID 목록 (중복 방지)
    const previousRecommendedIds = await this.getPreviouslyRecommendedIds(userId, today);

    // 추천 실행
    const restaurants = await this.runRecommendation(
      userId,
      user.location,
      filterCategoryIds,
      filterPriceRange,
      filterWalkMinutes,
      user.excludedCategories.map((ec) => ec.categoryId),
      previousRecommendedIds,
    );

    const newRefreshCount = currentRefresh + 1;

    // 추천 로그 저장
    const log = await this.prisma.recommendationLog.create({
      data: {
        userId,
        recommendationDate: today,
        refreshCount: newRefreshCount,
        filterCategoryIds: filterCategoryIds ?? [],
        filterPriceRange: filterPriceRange ?? undefined,
        filterWalkMinutes: filterWalkMinutes,
        items: {
          create: restaurants.map((r, i) => ({
            restaurantId: r.id,
            displayOrder: i + 1,
          })),
        },
      },
    });

    const enriched = await this.enrichRestaurants(restaurants, userId);

    return {
      restaurants: enriched,
      refreshCount: newRefreshCount,
      maxRefreshCount: MAX_REFRESH,
      filterApplied: {
        categoryIds: filterCategoryIds,
        priceRange: filterPriceRange,
        walkMinutes: filterWalkMinutes,
      },
    };
  }

  /**
   * 5단계 필터링 + 4단계 조건 완화 (기능 명세 01의 3.1절)
   */
  private async runRecommendation(
    userId: string,
    userLocation: { latitude: any; longitude: any },
    filterCategoryIds: string[] | null,
    filterPriceRange: PriceRange | null,
    filterWalkMinutes: number,
    excludedCategoryIds: string[],
    previousRecommendedIds: string[] = [],
  ) {
    const userLat = Number(userLocation.latitude);
    const userLng = Number(userLocation.longitude);

    // 최근 먹은 이력 조회
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentHistories = await this.prisma.eatingHistory.findMany({
      where: {
        userId,
        eatenDate: { gte: fiveDaysAgo },
      },
      include: { restaurant: { select: { categoryId: true } } },
    });

    const recentRestaurantIds5d = recentHistories
      .filter((h) => h.restaurantId)
      .map((h) => h.restaurantId!);

    const recentRestaurantIds3d = recentHistories
      .filter((h) => h.restaurantId && h.eatenDate >= threeDaysAgo)
      .map((h) => h.restaurantId!);

    const recentCategoryIds3d = recentHistories
      .filter((h) => h.eatenDate >= threeDaysAgo && h.restaurant)
      .map((h) => h.restaurant!.categoryId);

    // 기본 조건: 폐업 아닌 식당
    const baseWhere: Prisma.RestaurantWhereInput = {
      isClosed: false,
      id: { notIn: previousRecommendedIds.length > 0 ? previousRecommendedIds : undefined },
    };

    // 카테고리 필터 (제외 카테고리 적용)
    if (filterCategoryIds) {
      // 제외 카테고리는 항상 빼기
      const effectiveIds = filterCategoryIds.filter((id) => !excludedCategoryIds.includes(id));
      baseWhere.categoryId = { in: effectiveIds };
    } else if (excludedCategoryIds.length > 0) {
      baseWhere.categoryId = { notIn: excludedCategoryIds };
    }

    // 가격대 필터
    if (filterPriceRange) {
      baseWhere.priceRange = filterPriceRange;
    }

    // 전체 후보 조회
    const allCandidates = await this.prisma.restaurant.findMany({
      where: baseWhere,
      include: {
        category: { select: { id: true, name: true, colorCode: true } },
      },
    });

    // 거리 계산 및 필터링
    type CandidateWithDistance = typeof allCandidates[number] & { walkMinutes: number };

    const withDistance: CandidateWithDistance[] = allCandidates
      .map((r) => {
        const dist = haversineDistance(
          userLat, userLng,
          Number(r.latitude), Number(r.longitude),
        );
        return { ...r, walkMinutes: distanceToWalkMinutes(dist) };
      })
      .filter((r) => r.walkMinutes <= filterWalkMinutes);

    // 5단계 필터링
    // Step 3: 최근 5일 먹은 식당 제외
    let candidates = withDistance.filter((r) => !recentRestaurantIds5d.includes(r.id));

    // Step 4: 최근 3일 먹은 카테고리 가중치 낮춤 (해당 카테고리의 식당을 뒤로)
    candidates = this.applyCategoryWeight(candidates, recentCategoryIds3d);

    // 3개 이상이면 선택
    if (candidates.length >= 3) {
      return this.selectRandom(candidates, 3);
    }

    // 조건 완화 시작
    // 1단계: 도보 거리 15분으로 확대
    if (filterWalkMinutes < 15) {
      candidates = withDistance.length >= 3
        ? withDistance
        : allCandidates
            .map((r) => {
              const dist = haversineDistance(userLat, userLng, Number(r.latitude), Number(r.longitude));
              return { ...r, walkMinutes: distanceToWalkMinutes(dist) };
            })
            .filter((r) => r.walkMinutes <= 15);

      candidates = candidates.filter((r) => !recentRestaurantIds5d.includes(r.id));
      candidates = this.applyCategoryWeight(candidates, recentCategoryIds3d);

      if (candidates.length >= 3) {
        return this.selectRandom(candidates, 3);
      }
    }

    // 2단계: 먹은 이력 제외 5일 → 3일
    const relaxedCandidates15 = allCandidates
      .map((r) => {
        const dist = haversineDistance(userLat, userLng, Number(r.latitude), Number(r.longitude));
        return { ...r, walkMinutes: distanceToWalkMinutes(dist) };
      })
      .filter((r) => r.walkMinutes <= 15);

    candidates = relaxedCandidates15.filter((r) => !recentRestaurantIds3d.includes(r.id));
    candidates = this.applyCategoryWeight(candidates, recentCategoryIds3d);

    if (candidates.length >= 3) {
      return this.selectRandom(candidates, 3);
    }

    // 3단계: 카테고리 가중치 제거
    candidates = relaxedCandidates15.filter((r) => !recentRestaurantIds3d.includes(r.id));
    if (candidates.length >= 3) {
      return this.selectRandom(candidates, 3);
    }

    // 4단계: 먹은 이력 제외 완전 해제
    candidates = relaxedCandidates15;
    if (candidates.length >= 3) {
      return this.selectRandom(candidates, 3);
    }

    // 4단계에서도 3개 미만이면 있는 만큼 반환
    return this.selectRandom(candidates, Math.min(3, candidates.length));
  }

  /** 카테고리 가중치 적용: 최근 3일 먹은 카테고리의 식당을 뒤로 */
  private applyCategoryWeight<T extends { category: { id: string } }>(
    candidates: T[],
    recentCategoryIds: string[],
  ): T[] {
    if (recentCategoryIds.length === 0) return candidates;

    const preferred = candidates.filter((c) => !recentCategoryIds.includes(c.category.id));
    const deprioritized = candidates.filter((c) => recentCategoryIds.includes(c.category.id));

    return [...preferred, ...deprioritized];
  }

  /** 랜덤 N개 선택 */
  private selectRandom<T>(candidates: T[], count: number): T[] {
    if (candidates.length <= count) return candidates;

    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /** 오늘 이전에 추천된 식당 ID 목록 */
  private async getPreviouslyRecommendedIds(userId: string, today: Date): Promise<string[]> {
    const logs = await this.prisma.recommendationLog.findMany({
      where: { userId, recommendationDate: today },
      include: { items: { select: { restaurantId: true } } },
    });

    return logs.flatMap((log) => log.items.map((item) => item.restaurantId));
  }

  /** 식당에 즐겨찾기 + 방문이력 정보 추가 */
  private async enrichRestaurants(
    restaurants: Array<{
      id: string;
      name: string;
      category: { id: string; name: string; colorCode: string };
      walkMinutes: number;
      priceRange: any;
      thumbnailUrl: string | null;
      description: string | null;
    }>,
    userId: string,
  ) {
    if (restaurants.length === 0) return [];

    const restaurantIds = restaurants.map((r) => r.id);

    const favorites = await this.prisma.favorite.findMany({
      where: { userId, restaurantId: { in: restaurantIds } },
    });
    const favoriteSet = new Set(favorites.map((f) => f.restaurantId));

    const histories = await this.prisma.eatingHistory.findMany({
      where: { userId, restaurantId: { in: restaurantIds } },
    });
    const visitMap = new Map<string, { rating: number; visitCount: number }>();
    for (const h of histories) {
      if (!h.restaurantId) continue;
      const existing = visitMap.get(h.restaurantId);
      if (existing) {
        existing.visitCount++;
        existing.rating = Math.round(
          (existing.rating * (existing.visitCount - 1) + h.rating) / existing.visitCount,
        );
      } else {
        visitMap.set(h.restaurantId, { rating: h.rating, visitCount: 1 });
      }
    }

    return restaurants.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      walkMinutes: r.walkMinutes,
      priceRange: r.priceRange,
      thumbnailUrl: r.thumbnailUrl,
      description: r.description,
      isFavorite: favoriteSet.has(r.id),
      myVisit: visitMap.get(r.id) ?? null,
    }));
  }
}
