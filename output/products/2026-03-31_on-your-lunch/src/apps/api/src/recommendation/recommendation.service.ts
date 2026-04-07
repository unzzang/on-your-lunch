import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PriceRange, Prisma } from '@prisma/client';
import {
  MAX_REFRESH_COUNT,
  RECOMMENDATION_COUNT,
} from '@on-your-lunch/shared-types';
import { calcWalkMinutes } from '../common/utils/geo.utils';

@Injectable()
export class RecommendationService {
  constructor(private prisma: PrismaService) {}

  async getToday(
    userId: string,
    params: {
      categoryIds?: string;
      priceRange?: string;
      walkMinutes?: number;
    },
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const location = await this.prisma.userLocation.findUnique({
      where: { userId },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferredCategories: true,
        excludedCategories: true,
      },
    });

    if (!user || !location) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '위치 또는 사용자 정보가 없습니다.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 필터 결정
    let categoryIds: string[] | null = null;
    if (params.categoryIds && params.categoryIds !== 'all') {
      categoryIds = params.categoryIds.split(',');
    } else if (!params.categoryIds) {
      // 사용자 선호 카테고리 사용
      if (user.preferredCategories.length > 0) {
        categoryIds = user.preferredCategories.map((pc) => pc.categoryId);
      }
    }

    const priceRange = (params.priceRange as PriceRange) ?? user.preferredPriceRange;
    const walkMinutes = params.walkMinutes ?? 10;

    // 기존 추천 로그 확인
    const existingLog = await this.prisma.recommendationLog.findFirst({
      where: {
        userId,
        recommendationDate: today,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            restaurant: {
              include: {
                category: true,
                favorites: { where: { userId } },
              },
            },
          },
        },
      },
    });

    if (existingLog && existingLog.items.length > 0) {
      // 기존 추천 반환
      const restaurants = existingLog.items
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((item) => {
          const r = item.restaurant;
          return {
            id: r.id,
            name: r.name,
            category: {
              id: r.category.id,
              name: r.category.name,
              colorCode: r.category.colorCode,
            },
            walkMinutes: calcWalkMinutes(
              Number(location.latitude),
              Number(location.longitude),
              Number(r.latitude),
              Number(r.longitude),
            ),
            priceRange: r.priceRange,
            latitude: Number(r.latitude),
            longitude: Number(r.longitude),
            thumbnailUrl: r.thumbnailUrl,
            description: r.description,
            isFavorite: r.favorites.length > 0,
            myVisit: null,
            isClosed: r.isClosed,
          };
        });

      return {
        restaurants,
        refreshCount: existingLog.refreshCount,
        maxRefreshCount: MAX_REFRESH_COUNT,
        filterApplied: {
          categoryIds,
          priceRange,
          walkMinutes,
        },
      };
    }

    // 새 추천 생성
    return this.generateRecommendation(userId, location, {
      categoryIds,
      priceRange,
      walkMinutes,
      refreshCount: 0,
    });
  }

  async refresh(
    userId: string,
    params: {
      categoryIds?: string[];
      priceRange?: PriceRange;
      walkMinutes?: number;
    },
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingLog = await this.prisma.recommendationLog.findFirst({
      where: { userId, recommendationDate: today },
      orderBy: { createdAt: 'desc' },
    });

    const currentRefreshCount = existingLog?.refreshCount ?? 0;

    if (currentRefreshCount >= MAX_REFRESH_COUNT) {
      throw new HttpException(
        {
          code: 'REFRESH_LIMIT_EXCEEDED',
          message: '오늘 추천을 모두 사용했어요. 식당 탐색에서 직접 찾아보세요!',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const location = await this.prisma.userLocation.findUnique({
      where: { userId },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !location) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '위치 또는 사용자 정보가 없습니다.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const categoryIds = params.categoryIds ?? null;
    const priceRange = params.priceRange ?? user.preferredPriceRange;
    const walkMinutes = params.walkMinutes ?? 10;

    return this.generateRecommendation(userId, location, {
      categoryIds,
      priceRange,
      walkMinutes,
      refreshCount: currentRefreshCount + 1,
    });
  }

  private async generateRecommendation(
    userId: string,
    location: { latitude: number | Prisma.Decimal; longitude: number | Prisma.Decimal },
    params: {
      categoryIds: string[] | null;
      priceRange: PriceRange;
      walkMinutes: number;
      refreshCount: number;
    },
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 제외 카테고리 조회
    const excludedCats = await this.prisma.userExcludedCategory.findMany({
      where: { userId },
    });
    const excludedCatIds = excludedCats.map((ec) => ec.categoryId);

    // 최근 5일 먹은 식당 제외
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const recentHistories = await this.prisma.eatingHistory.findMany({
      where: {
        userId,
        eatenDate: { gte: fiveDaysAgo },
        restaurantId: { not: null },
      },
      select: { restaurantId: true },
    });
    const recentRestaurantIds = recentHistories
      .map((h) => h.restaurantId)
      .filter((id): id is string => id !== null);

    const where: Prisma.RestaurantWhereInput = {
      isClosed: false,
    };

    if (params.categoryIds && params.categoryIds.length > 0) {
      where.categoryId = { in: params.categoryIds, notIn: excludedCatIds };
    } else if (excludedCatIds.length > 0) {
      where.categoryId = { notIn: excludedCatIds };
    }

    if (params.priceRange) {
      where.priceRange = params.priceRange;
    }

    if (recentRestaurantIds.length > 0) {
      where.id = { notIn: recentRestaurantIds };
    }

    // 모든 후보 조회
    const candidates = await this.prisma.restaurant.findMany({
      where,
      include: {
        category: true,
        favorites: { where: { userId } },
      },
    });

    // 도보 거리 필터
    const filtered = candidates.filter((r) => {
      const wm = calcWalkMinutes(
        Number(location.latitude),
        Number(location.longitude),
        Number(r.latitude),
        Number(r.longitude),
      );
      return wm <= params.walkMinutes;
    });

    // 랜덤 3개 선택
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, RECOMMENDATION_COUNT);

    // 추천 로그 저장
    await this.prisma.recommendationLog.create({
      data: {
        userId,
        recommendationDate: today,
        refreshCount: params.refreshCount,
        filterCategoryIds: params.categoryIds ?? [],
        filterPriceRange: params.priceRange,
        filterWalkMinutes: params.walkMinutes,
        items: {
          create: selected.map((r, i) => ({
            restaurantId: r.id,
            displayOrder: i + 1,
          })),
        },
      },
    });

    const restaurants = selected.map((r) => ({
      id: r.id,
      name: r.name,
      category: {
        id: r.category.id,
        name: r.category.name,
        colorCode: r.category.colorCode,
      },
      walkMinutes: calcWalkMinutes(
        Number(location.latitude),
        Number(location.longitude),
        Number(r.latitude),
        Number(r.longitude),
      ),
      priceRange: r.priceRange,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      thumbnailUrl: r.thumbnailUrl,
      description: r.description,
      isFavorite: r.favorites.length > 0,
      myVisit: null,
      isClosed: r.isClosed,
    }));

    return {
      restaurants,
      refreshCount: params.refreshCount,
      maxRefreshCount: MAX_REFRESH_COUNT,
      filterApplied: {
        categoryIds: params.categoryIds,
        priceRange: params.priceRange,
        walkMinutes: params.walkMinutes,
      },
    };
  }
}
