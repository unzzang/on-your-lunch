import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { MAX_REFRESH_COUNT } from '@shared-types';

// 도보 거리 계산 상수
const WALK_SPEED_M_PER_MIN = 80;
const ROAD_CORRECTION = 1.3;
const RECOMMENDATION_COUNT = 3;

@Injectable()
export class RecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Haversine 직선 거리(미터) 계산
   */
  private haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * 도보 시간(분) 계산
   */
  private calculateWalkMinutes(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const dist = this.haversineDistance(lat1, lng1, lat2, lng2);
    return Math.round((dist * ROAD_CORRECTION) / WALK_SPEED_M_PER_MIN);
  }

  /**
   * 오늘 날짜 문자열 (YYYY-MM-DD)
   */
  private getTodayDateStr(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * N일 전 날짜 계산
   */
  private getDaysAgoDate(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * 사용자 필터 정보 조회 (위치, 취향, 기본 설정)
   */
  private async getUserFilterContext(userId: string) {
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
        { code: 'VALIDATION_ERROR', message: '회사 위치를 먼저 설정해주세요.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      latitude: Number(user.location.latitude),
      longitude: Number(user.location.longitude),
      preferredCategoryIds: user.preferredCategories.map((pc) => pc.categoryId),
      excludedCategoryIds: user.excludedCategories.map((ec) => ec.categoryId),
      preferredPriceRange: user.preferredPriceRange,
    };
  }

  /**
   * 오늘의 추천 조회 — 5단계 필터링 + 조건 완화 규칙
   */
  async getToday(
    userId: string,
    filters: { categoryIds?: string; priceRange?: string; walkMinutes?: number },
  ) {
    const ctx = await this.getUserFilterContext(userId);
    const today = this.getTodayDateStr();

    // 필터 결정: 쿼리 파라미터 > 사용자 기본 설정
    let categoryIds: string[] | null = null; // null = 전체
    if (filters.categoryIds) {
      if (filters.categoryIds === 'all') {
        categoryIds = null; // 전체 카테고리
      } else {
        categoryIds = filters.categoryIds.split(',').filter(Boolean);
        if (categoryIds.length === 0) {
          throw new HttpException(
            { code: 'VALIDATION_ERROR', message: 'categoryIds 값이 비어 있습니다.' },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    } else {
      // 파라미터 생략 시 → 사용자 선호 카테고리 적용
      if (ctx.preferredCategoryIds.length > 0) {
        categoryIds = ctx.preferredCategoryIds;
      }
    }

    const priceRange = filters.priceRange || ctx.preferredPriceRange;
    const walkMinutes = filters.walkMinutes || 10;

    // 오늘 기존 추천 로그에서 이전에 추천된 식당 제외 (새로고침 시 중복 방지)
    const todayLogs = await this.prisma.recommendationLog.findMany({
      where: {
        userId,
        recommendationDate: new Date(today),
      },
      include: { items: true },
    });

    const previouslyRecommendedIds = new Set<string>();
    for (const log of todayLogs) {
      for (const item of log.items) {
        previouslyRecommendedIds.add(item.restaurantId);
      }
    }

    // 추천 실행
    const result = await this.generateRecommendation({
      userId,
      latitude: ctx.latitude,
      longitude: ctx.longitude,
      categoryIds,
      excludedCategoryIds: ctx.excludedCategoryIds,
      priceRange,
      walkMinutes,
      previouslyRecommendedIds,
    });

    // 추천 로그 저장
    if (result.restaurants.length > 0) {
      await this.prisma.recommendationLog.create({
        data: {
          userId,
          recommendationDate: new Date(today),
          refreshCount: 0,
          filterCategoryIds: categoryIds || [],
          filterPriceRange: priceRange,
          filterWalkMinutes: walkMinutes,
          items: {
            create: result.restaurants.map((r, idx) => ({
              restaurantId: r.id,
              displayOrder: idx + 1,
            })),
          },
        },
      });
    }

    // 오늘의 총 새로고침 횟수 계산
    const refreshCount = todayLogs.reduce(
      (sum, log) => sum + log.refreshCount,
      0,
    );

    return {
      restaurants: result.restaurants,
      refreshCount,
      maxRefreshCount: MAX_REFRESH_COUNT,
      filterApplied: {
        categoryIds: categoryIds,
        priceRange,
        walkMinutes,
      },
    };
  }

  /**
   * 추천 새로고침 — 횟수 확인 + 새 추천 생성
   */
  async refresh(
    userId: string,
    filters: { categoryIds?: string[]; priceRange?: string; walkMinutes?: number },
  ) {
    const ctx = await this.getUserFilterContext(userId);
    const today = this.getTodayDateStr();

    // 오늘 새로고침 횟수 확인
    const todayLogs = await this.prisma.recommendationLog.findMany({
      where: {
        userId,
        recommendationDate: new Date(today),
      },
      include: { items: true },
    });

    const totalRefreshCount = todayLogs.reduce(
      (sum, log) => sum + log.refreshCount,
      0,
    );

    if (totalRefreshCount >= MAX_REFRESH_COUNT) {
      throw new HttpException(
        {
          code: 'REFRESH_LIMIT_EXCEEDED',
          message: '오늘 추천을 모두 사용했어요. 식당 탐색에서 직접 찾아보세요!',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 필터 결정
    let categoryIds: string[] | null = null;
    if (filters.categoryIds) {
      if (filters.categoryIds.length === 1 && filters.categoryIds[0] === 'all') {
        categoryIds = null;
      } else if (filters.categoryIds.length === 0) {
        throw new HttpException(
          { code: 'VALIDATION_ERROR', message: 'categoryIds 값이 비어 있습니다.' },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        categoryIds = filters.categoryIds;
      }
    } else {
      if (ctx.preferredCategoryIds.length > 0) {
        categoryIds = ctx.preferredCategoryIds;
      }
    }

    const priceRange = filters.priceRange || ctx.preferredPriceRange;
    const walkMinutes = filters.walkMinutes || 10;

    // 이전 추천 식당 수집 (중복 방지)
    const previouslyRecommendedIds = new Set<string>();
    for (const log of todayLogs) {
      for (const item of log.items) {
        previouslyRecommendedIds.add(item.restaurantId);
      }
    }

    // 새 추천 생성
    const result = await this.generateRecommendation({
      userId,
      latitude: ctx.latitude,
      longitude: ctx.longitude,
      categoryIds,
      excludedCategoryIds: ctx.excludedCategoryIds,
      priceRange,
      walkMinutes,
      previouslyRecommendedIds,
    });

    // 추천 로그 저장 (새로고침 카운트 증가)
    if (result.restaurants.length > 0) {
      await this.prisma.recommendationLog.create({
        data: {
          userId,
          recommendationDate: new Date(today),
          refreshCount: totalRefreshCount + 1,
          filterCategoryIds: categoryIds || [],
          filterPriceRange: priceRange,
          filterWalkMinutes: walkMinutes,
          items: {
            create: result.restaurants.map((r, idx) => ({
              restaurantId: r.id,
              displayOrder: idx + 1,
            })),
          },
        },
      });
    }

    return {
      restaurants: result.restaurants,
      refreshCount: totalRefreshCount + 1,
      maxRefreshCount: MAX_REFRESH_COUNT,
      filterApplied: {
        categoryIds,
        priceRange,
        walkMinutes,
      },
    };
  }

  /**
   * 추천 알고리즘 핵심 — 5단계 필터링 + 조건 완화 규칙
   *
   * 1. 도보 거리 필터링
   * 2. 카테고리/가격대 필터링 + 제외 카테고리
   * 3. 최근 5일 먹은 식당 제외
   * 4. 최근 3일 먹은 카테고리 가중치 낮춤
   * 5. 랜덤 3개 선택
   *
   * 조건 완화 순서:
   * 0단계: 기본 조건
   * 1단계: 도보 15분으로 확대
   * 2단계: 먹은 이력 제외 5일 → 3일
   * 3단계: 카테고리 가중치 제거
   * 4단계: 먹은 이력 제외 완전 해제
   */
  private async generateRecommendation(params: {
    userId: string;
    latitude: number;
    longitude: number;
    categoryIds: string[] | null;
    excludedCategoryIds: string[];
    priceRange: string;
    walkMinutes: number;
    previouslyRecommendedIds: Set<string>;
  }) {
    const {
      userId,
      latitude,
      longitude,
      categoryIds,
      excludedCategoryIds,
      priceRange,
      walkMinutes,
      previouslyRecommendedIds,
    } = params;

    // 사용자 즐겨찾기 조회
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      select: { restaurantId: true },
    });
    const favoriteIds = new Set(favorites.map((f) => f.restaurantId));

    // 방문 이력 조회
    const allVisits = await this.prisma.eatingHistory.findMany({
      where: { userId, restaurantId: { not: null } },
      select: { restaurantId: true, eatenDate: true, rating: true },
      orderBy: { eatenDate: 'desc' },
    });

    // 식당별 방문 정보 집계
    const visitMap = new Map<string, { rating: number; visitCount: number }>();
    for (const v of allVisits) {
      if (!v.restaurantId) continue;
      const existing = visitMap.get(v.restaurantId);
      if (existing) {
        existing.visitCount += 1;
        // 가장 최근 별점 사용
      } else {
        visitMap.set(v.restaurantId, { rating: v.rating, visitCount: 1 });
      }
    }

    // 조건 완화 단계별 시도
    for (let relaxStep = 0; relaxStep <= 4; relaxStep++) {
      const candidates = await this.getCandidates({
        latitude,
        longitude,
        categoryIds,
        excludedCategoryIds,
        priceRange,
        walkMinutes,
        previouslyRecommendedIds,
        relaxStep,
        userId,
      });

      if (candidates.length >= RECOMMENDATION_COUNT) {
        // 4단계: 최근 3일 먹은 카테고리 가중치 (relaxStep < 3일 때만 적용)
        let selected: typeof candidates;
        if (relaxStep < 3) {
          selected = this.weightedRandomSelect(candidates, userId, allVisits);
        } else {
          selected = this.randomSelect(candidates, RECOMMENDATION_COUNT);
        }

        // 식당 목록 형식으로 변환
        return {
          restaurants: selected.map((r) => {
            const wm = this.calculateWalkMinutes(
              latitude,
              longitude,
              Number(r.latitude),
              Number(r.longitude),
            );
            const visit = visitMap.get(r.id);

            return {
              id: r.id,
              name: r.name,
              category: {
                id: r.categoryId,
                name: r.categoryName,
                colorCode: r.colorCode,
              },
              walkMinutes: wm,
              priceRange: r.priceRange,
              thumbnailUrl: r.thumbnailUrl,
              description: r.description,
              isFavorite: favoriteIds.has(r.id),
              myVisit: visit
                ? { rating: visit.rating, visitCount: visit.visitCount }
                : null,
            };
          }),
        };
      }

      // 후보가 0보다 크지만 3 미만이면 가능한 만큼 반환 (4단계까지 시도 후)
      if (relaxStep === 4 && candidates.length > 0) {
        return {
          restaurants: candidates.map((r) => {
            const wm = this.calculateWalkMinutes(
              latitude,
              longitude,
              Number(r.latitude),
              Number(r.longitude),
            );
            const visit = visitMap.get(r.id);

            return {
              id: r.id,
              name: r.name,
              category: {
                id: r.categoryId,
                name: r.categoryName,
                colorCode: r.colorCode,
              },
              walkMinutes: wm,
              priceRange: r.priceRange,
              thumbnailUrl: r.thumbnailUrl,
              description: r.description,
              isFavorite: favoriteIds.has(r.id),
              myVisit: visit
                ? { rating: visit.rating, visitCount: visit.visitCount }
                : null,
            };
          }),
        };
      }
    }

    // 4단계까지 완화해도 후보 0개
    return { restaurants: [] };
  }

  /**
   * 조건 완화 단계에 따른 후보 식당 조회
   */
  private async getCandidates(params: {
    latitude: number;
    longitude: number;
    categoryIds: string[] | null;
    excludedCategoryIds: string[];
    priceRange: string;
    walkMinutes: number;
    previouslyRecommendedIds: Set<string>;
    relaxStep: number;
    userId: string;
  }) {
    const {
      latitude,
      longitude,
      categoryIds,
      excludedCategoryIds,
      priceRange,
      walkMinutes,
      previouslyRecommendedIds,
      relaxStep,
      userId,
    } = params;

    // 1단계 완화: 도보 15분으로 확대
    const effectiveWalkMinutes =
      relaxStep >= 1 && walkMinutes < 15 ? 15 : walkMinutes;

    // 직선 거리 한도 (미터)
    const maxDistMeters =
      (effectiveWalkMinutes * WALK_SPEED_M_PER_MIN) / ROAD_CORRECTION;

    // 먹은 이력 제외 기간 결정
    let excludeDays: number;
    if (relaxStep >= 4) {
      excludeDays = 0; // 제외 완전 해제
    } else if (relaxStep >= 2) {
      excludeDays = 3; // 5일 → 3일로 단축
    } else {
      excludeDays = 5; // 기본 5일
    }

    // 제외할 식당 ID 조회 (최근 N일 먹은 식당)
    const excludedRestaurantIds = new Set<string>(previouslyRecommendedIds);

    if (excludeDays > 0) {
      const recentHistories = await this.prisma.eatingHistory.findMany({
        where: {
          userId,
          restaurantId: { not: null },
          eatenDate: { gte: this.getDaysAgoDate(excludeDays) },
        },
        select: { restaurantId: true },
      });
      for (const h of recentHistories) {
        if (h.restaurantId) excludedRestaurantIds.add(h.restaurantId);
      }
    }

    // PostGIS 거리 기반 쿼리로 후보 조회
    const candidates = await this.prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        category_id: string;
        category_name: string;
        color_code: string;
        latitude: number;
        longitude: number;
        price_range: string | null;
        thumbnail_url: string | null;
        description: string | null;
      }>
    >`
      SELECT r.id, r.name, r.category_id, c.name AS category_name, c.color_code,
             r.latitude, r.longitude, r.price_range, r.thumbnail_url, r.description
      FROM restaurant r
      JOIN category c ON r.category_id = c.id
      WHERE r.is_closed = false
        AND r.is_user_created = false
        AND ST_DWithin(
          r.geom,
          ST_MakePoint(${longitude}, ${latitude})::geography,
          ${maxDistMeters}
        )
    `;

    // 애플리케이션 레벨 필터링
    let filtered = candidates
      .map((r) => ({
        id: r.id,
        name: r.name,
        categoryId: r.category_id,
        categoryName: r.category_name,
        colorCode: r.color_code,
        latitude: r.latitude,
        longitude: r.longitude,
        priceRange: r.price_range,
        thumbnailUrl: r.thumbnail_url,
        description: r.description,
      }))
      // 이전 추천 + 최근 먹은 식당 제외
      .filter((r) => !excludedRestaurantIds.has(r.id))
      // 제외 카테고리 필터
      .filter((r) => !excludedCategoryIds.includes(r.categoryId));

    // 카테고리 필터 (null이면 전체)
    if (categoryIds && categoryIds.length > 0) {
      filtered = filtered.filter((r) => categoryIds.includes(r.categoryId));
    }

    // 가격대 필터 (가격 정보 없는 식당은 제외)
    if (priceRange) {
      filtered = filtered.filter(
        (r) => r.priceRange === priceRange || r.priceRange === null,
      );
    }

    return filtered;
  }

  /**
   * 카테고리 가중치 기반 랜덤 선택 (최근 3일 먹은 카테고리 확률 감소)
   */
  private weightedRandomSelect(
    candidates: Array<{
      id: string;
      name: string;
      categoryId: string;
      categoryName: string;
      colorCode: string;
      latitude: number;
      longitude: number;
      priceRange: string | null;
      thumbnailUrl: string | null;
      description: string | null;
    }>,
    userId: string,
    allVisits: Array<{ restaurantId: string | null; eatenDate: Date; rating: number }>,
  ) {
    // 최근 3일 먹은 카테고리 파악 (이력에서 카테고리 추출은 간소화)
    const threeDaysAgo = this.getDaysAgoDate(3);
    const recentCategoryIds = new Set<string>();

    // 후보 목록에서 최근 3일 방문한 카테고리를 추출
    const recentRestaurantIds = new Set(
      allVisits
        .filter((v) => v.restaurantId && new Date(v.eatenDate) >= threeDaysAgo)
        .map((v) => v.restaurantId!),
    );

    for (const c of candidates) {
      if (recentRestaurantIds.has(c.id)) {
        recentCategoryIds.add(c.categoryId);
      }
    }

    // 가중치 부여: 최근 먹은 카테고리 = 0.3, 나머지 = 1.0
    const weights = candidates.map((c) =>
      recentCategoryIds.has(c.categoryId) ? 0.3 : 1.0,
    );

    return this.weightedSample(candidates, weights, RECOMMENDATION_COUNT);
  }

  /**
   * 가중치 기반 랜덤 샘플링 (중복 없이)
   */
  private weightedSample<T>(items: T[], weights: number[], count: number): T[] {
    const result: T[] = [];
    const used = new Set<number>();

    for (let i = 0; i < Math.min(count, items.length); i++) {
      // 사용 가능한 항목의 가중치 합
      let totalWeight = 0;
      for (let j = 0; j < items.length; j++) {
        if (!used.has(j)) totalWeight += weights[j];
      }

      // 랜덤 선택
      let random = Math.random() * totalWeight;
      for (let j = 0; j < items.length; j++) {
        if (used.has(j)) continue;
        random -= weights[j];
        if (random <= 0) {
          result.push(items[j]);
          used.add(j);
          break;
        }
      }
    }

    return result;
  }

  /**
   * 단순 랜덤 선택 (가중치 없이)
   */
  private randomSelect<T>(items: T[], count: number): T[] {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}
