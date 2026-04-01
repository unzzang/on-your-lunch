import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';

// 도보 거리 계산 상수
const WALK_SPEED_M_PER_MIN = 80; // 분당 80m
const ROAD_CORRECTION = 1.3; // 도로 보정 계수

@Injectable()
export class RestaurantService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 도보 시간(분) 계산 — Haversine 직선 거리 × 1.3 ÷ 분당 80m
   */
  private calculateWalkMinutes(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceMeters = R * c;

    // 직선 거리 × 보정 계수 ÷ 분당 속도
    return Math.round((distanceMeters * ROAD_CORRECTION) / WALK_SPEED_M_PER_MIN);
  }

  /**
   * 사용자 회사 위치 조회 (공통)
   */
  private async getUserLocation(userId: string) {
    const location = await this.prisma.userLocation.findUnique({
      where: { userId },
    });
    if (!location) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '회사 위치를 먼저 설정해주세요.' },
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
    };
  }

  /**
   * 사용자 즐겨찾기 ID 목록 조회 (공통)
   */
  private async getUserFavoriteIds(userId: string): Promise<Set<string>> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      select: { restaurantId: true },
    });
    return new Set(favorites.map((f) => f.restaurantId));
  }

  /**
   * 사용자 방문 이력 조회 (공통) — 식당별 최근 방문일, 평균 별점, 방문 횟수
   */
  private async getUserVisits(
    userId: string,
  ): Promise<Map<string, { lastDate: string; rating: number; visitCount: number }>> {
    const histories = await this.prisma.eatingHistory.findMany({
      where: { userId, restaurantId: { not: null } },
      select: { restaurantId: true, eatenDate: true, rating: true },
      orderBy: { eatenDate: 'desc' },
    });

    const visitMap = new Map<
      string,
      { lastDate: string; rating: number; visitCount: number; totalRating: number }
    >();

    for (const h of histories) {
      if (!h.restaurantId) continue;
      const existing = visitMap.get(h.restaurantId);
      if (existing) {
        existing.visitCount += 1;
        existing.totalRating += h.rating;
        existing.rating = Math.round(existing.totalRating / existing.visitCount);
      } else {
        const dateStr =
          h.eatenDate instanceof Date
            ? h.eatenDate.toISOString().split('T')[0]
            : String(h.eatenDate);
        visitMap.set(h.restaurantId, {
          lastDate: dateStr,
          rating: h.rating,
          visitCount: 1,
          totalRating: h.rating,
        });
      }
    }

    // totalRating 제거하고 반환
    const result = new Map<
      string,
      { lastDate: string; rating: number; visitCount: number }
    >();
    for (const [key, val] of visitMap) {
      result.set(key, {
        lastDate: val.lastDate,
        rating: val.rating,
        visitCount: val.visitCount,
      });
    }
    return result;
  }

  /**
   * 식당 상세 조회 — 메뉴 + 사진 + 즐겨찾기 여부 + 방문 이력 포함
   */
  async getDetail(userId: string, restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        category: true,
        menus: { orderBy: { sortOrder: 'asc' } },
        photos: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!restaurant) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: '식당을 찾을 수 없습니다.' },
        HttpStatus.NOT_FOUND,
      );
    }

    const userLoc = await this.getUserLocation(userId);
    const favoriteIds = await this.getUserFavoriteIds(userId);
    const visits = await this.getUserVisits(userId);

    const walkMinutes = this.calculateWalkMinutes(
      userLoc.latitude,
      userLoc.longitude,
      Number(restaurant.latitude),
      Number(restaurant.longitude),
    );

    const visit = visits.get(restaurant.id);

    return {
      id: restaurant.id,
      name: restaurant.name,
      category: {
        id: restaurant.category.id,
        name: restaurant.category.name,
        colorCode: restaurant.category.colorCode,
      },
      address: restaurant.address,
      latitude: Number(restaurant.latitude),
      longitude: Number(restaurant.longitude),
      walkMinutes,
      phone: restaurant.phone,
      description: restaurant.description,
      priceRange: restaurant.priceRange,
      businessHours: restaurant.businessHours,
      thumbnailUrl: restaurant.thumbnailUrl,
      photos: restaurant.photos.map((p) => ({
        id: p.id,
        imageUrl: p.imageUrl,
        isThumbnail: p.isThumbnail,
      })),
      menus: restaurant.menus.map((m) => ({
        id: m.id,
        name: m.name,
        price: m.price,
      })),
      isFavorite: favoriteIds.has(restaurant.id),
      isClosed: restaurant.isClosed,
      myVisit: visit
        ? { lastDate: visit.lastDate, rating: visit.rating, visitCount: visit.visitCount }
        : null,
    };
  }

  /**
   * 식당 검색 — 식당명 + 메뉴명 검색, 도보 15분 이내
   */
  async search(userId: string, q: string, page = 1, limit = 20) {
    if (!q || q.length < 2) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '검색어는 2자 이상 입력해주세요.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const userLoc = await this.getUserLocation(userId);
    const maxDistanceMeters = (15 * WALK_SPEED_M_PER_MIN) / ROAD_CORRECTION; // 도보 15분 직선 거리

    // LIKE 와일드카드 이스케이프: 사용자 입력의 %, _ 문자를 안전하게 처리
    const escapedQ = q.replace(/%/g, '\\%').replace(/_/g, '\\_');
    const likePattern = '%' + escapedQ + '%';

    // PostGIS로 거리 내 식당 조회 + 이름/메뉴 검색
    const restaurants = await this.prisma.$queryRaw<
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
        is_closed: boolean;
      }>
    >`
      SELECT DISTINCT r.id, r.name, r.category_id, c.name AS category_name, c.color_code,
             r.latitude, r.longitude, r.price_range, r.thumbnail_url, r.description, r.is_closed
      FROM restaurant r
      JOIN category c ON r.category_id = c.id
      LEFT JOIN restaurant_menu rm ON r.id = rm.restaurant_id
      WHERE r.is_closed = false
        AND ST_DWithin(
          r.geom,
          ST_MakePoint(${userLoc.longitude}, ${userLoc.latitude})::geography,
          ${maxDistanceMeters}
        )
        AND (r.name ILIKE ${likePattern} OR rm.name ILIKE ${likePattern})
      ORDER BY r.name
      LIMIT ${limit}
      OFFSET ${(page - 1) * limit}
    `;

    // 총 건수 조회
    const countResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT r.id) as count
      FROM restaurant r
      LEFT JOIN restaurant_menu rm ON r.id = rm.restaurant_id
      WHERE r.is_closed = false
        AND ST_DWithin(
          r.geom,
          ST_MakePoint(${userLoc.longitude}, ${userLoc.latitude})::geography,
          ${maxDistanceMeters}
        )
        AND (r.name ILIKE ${likePattern} OR rm.name ILIKE ${likePattern})
    `;

    const totalCount = Number(countResult[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const favoriteIds = await this.getUserFavoriteIds(userId);
    const visits = await this.getUserVisits(userId);

    const items = restaurants.map((r) => {
      const walkMinutes = this.calculateWalkMinutes(
        userLoc.latitude,
        userLoc.longitude,
        Number(r.latitude),
        Number(r.longitude),
      );
      const visit = visits.get(r.id);

      return {
        id: r.id,
        name: r.name,
        category: {
          id: r.category_id,
          name: r.category_name,
          colorCode: r.color_code,
        },
        walkMinutes,
        priceRange: r.price_range,
        thumbnailUrl: r.thumbnail_url,
        description: r.description,
        isFavorite: favoriteIds.has(r.id),
        myVisit: visit ? { rating: visit.rating, visitCount: visit.visitCount } : null,
        isClosed: r.is_closed,
      };
    });

    return {
      items,
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
      },
    };
  }

  /**
   * 식당 탐색 (리스트) — 카테고리 필터 + 정렬(거리/별점) + 페이지네이션
   */
  async list(
    userId: string,
    params: {
      categoryIds?: string;
      priceRange?: string;
      walkMinutes?: number;
      sort?: string;
      page?: number;
      limit?: number;
      favoritesOnly?: boolean;
    },
  ) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const sort = params.sort || 'distance';

    const userLoc = await this.getUserLocation(userId);
    const favoriteIds = await this.getUserFavoriteIds(userId);
    const visits = await this.getUserVisits(userId);

    // 필터 조건 구성
    const where: Prisma.RestaurantWhereInput = {
      isClosed: false,
    };

    // 카테고리 필터
    if (params.categoryIds) {
      const ids = params.categoryIds.split(',').filter(Boolean);
      if (ids.length > 0) {
        where.categoryId = { in: ids };
      }
    }

    // 가격대 필터
    if (params.priceRange) {
      where.priceRange = params.priceRange;
    }

    // 즐겨찾기만 보기
    if (params.favoritesOnly) {
      where.id = { in: Array.from(favoriteIds) };
    }

    // walkMinutes 필터가 있으면 DB 전체 조회 후 메모리 필터링 (도보 시간은 계산 필드)
    const needsWalkFilter = params.walkMinutes !== undefined && params.walkMinutes > 0;

    if (needsWalkFilter) {
      // 도보 시간 필터링: 전체 조회 후 필터 + 페이지네이션 적용
      const allRestaurants = await this.prisma.restaurant.findMany({
        where,
        include: { category: true },
      });

      let items = allRestaurants
        .map((r) => {
          const walkMinutes = this.calculateWalkMinutes(
            userLoc.latitude,
            userLoc.longitude,
            Number(r.latitude),
            Number(r.longitude),
          );
          const visit = visits.get(r.id);

          return {
            id: r.id,
            name: r.name,
            category: {
              id: r.category.id,
              name: r.category.name,
              colorCode: r.category.colorCode,
            },
            walkMinutes,
            priceRange: r.priceRange,
            thumbnailUrl: r.thumbnailUrl,
            description: r.description,
            isFavorite: favoriteIds.has(r.id),
            myVisit: visit ? { rating: visit.rating, visitCount: visit.visitCount } : null,
            isClosed: r.isClosed,
          };
        })
        .filter((r) => r.walkMinutes <= params.walkMinutes!);

      // 정렬
      if (sort === 'distance') {
        items.sort((a, b) => a.walkMinutes - b.walkMinutes);
      } else if (sort === 'rating') {
        items.sort((a, b) => {
          const ratingA = a.myVisit?.rating ?? 0;
          const ratingB = b.myVisit?.rating ?? 0;
          return ratingB - ratingA;
        });
      }

      const totalCount = items.length;
      const totalPages = Math.ceil(totalCount / limit);
      const paginatedItems = items.slice((page - 1) * limit, page * limit);

      return {
        items: paginatedItems,
        meta: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
        },
      };
    }

    const totalCount = await this.prisma.restaurant.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    const restaurants = await this.prisma.restaurant.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 각 식당에 도보 시간 계산
    let items = restaurants.map((r) => {
      const walkMinutes = this.calculateWalkMinutes(
        userLoc.latitude,
        userLoc.longitude,
        Number(r.latitude),
        Number(r.longitude),
      );
      const visit = visits.get(r.id);

      return {
        id: r.id,
        name: r.name,
        category: {
          id: r.category.id,
          name: r.category.name,
          colorCode: r.category.colorCode,
        },
        walkMinutes,
        priceRange: r.priceRange,
        thumbnailUrl: r.thumbnailUrl,
        description: r.description,
        isFavorite: favoriteIds.has(r.id),
        myVisit: visit ? { rating: visit.rating, visitCount: visit.visitCount } : null,
        isClosed: r.isClosed,
      };
    });

    // 정렬
    if (sort === 'distance') {
      items.sort((a, b) => a.walkMinutes - b.walkMinutes);
    } else if (sort === 'rating') {
      items.sort((a, b) => {
        const ratingA = a.myVisit?.rating ?? 0;
        const ratingB = b.myVisit?.rating ?? 0;
        return ratingB - ratingA; // 별점 높은 순
      });
    }

    return {
      items,
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
      },
    };
  }

  /**
   * 식당 지도 핀 조회 — 영역 내 식당 (카테고리 필터 포함)
   */
  async getMapPins(
    userId: string,
    bounds: {
      swLat: number;
      swLng: number;
      neLat: number;
      neLng: number;
      categoryIds?: string;
    },
  ) {
    const userLoc = await this.getUserLocation(userId);
    const favoriteIds = await this.getUserFavoriteIds(userId);

    // 카테고리 필터 조건 (UUID 형식 검증 + Prisma.sql 파라미터 바인딩)
    const categoryIds = bounds.categoryIds
      ? bounds.categoryIds.split(',').filter(Boolean)
      : [];

    // UUID 형식 검증
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validCategoryIds = categoryIds.filter((id) => UUID_REGEX.test(id));

    // 카테고리 필터가 있는 경우와 없는 경우를 분리하여 안전한 쿼리 사용
    let restaurants: Array<{
      id: string;
      name: string;
      color_code: string;
      latitude: number;
      longitude: number;
      price_range: string | null;
    }>;

    if (validCategoryIds.length > 0) {
      // 카테고리 필터 포함: Prisma.join으로 안전한 파라미터 바인딩
      restaurants = await this.prisma.$queryRaw`
        SELECT r.id, r.name, c.color_code, r.latitude, r.longitude, r.price_range
        FROM restaurant r
        JOIN category c ON r.category_id = c.id
        WHERE r.is_closed = false
          AND r.latitude BETWEEN ${bounds.swLat} AND ${bounds.neLat}
          AND r.longitude BETWEEN ${bounds.swLng} AND ${bounds.neLng}
          AND r.category_id IN (${Prisma.join(validCategoryIds.map((id) => Prisma.sql`${id}::uuid`))})
        LIMIT 200
      `;
    } else {
      // 카테고리 필터 없음
      restaurants = await this.prisma.$queryRaw`
        SELECT r.id, r.name, c.color_code, r.latitude, r.longitude, r.price_range
        FROM restaurant r
        JOIN category c ON r.category_id = c.id
        WHERE r.is_closed = false
          AND r.latitude BETWEEN ${bounds.swLat} AND ${bounds.neLat}
          AND r.longitude BETWEEN ${bounds.swLng} AND ${bounds.neLng}
        LIMIT 200
      `;
    }

    const pins = restaurants.map((r) => ({
      id: r.id,
      name: r.name,
      categoryColorCode: r.color_code,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      walkMinutes: this.calculateWalkMinutes(
        userLoc.latitude,
        userLoc.longitude,
        Number(r.latitude),
        Number(r.longitude),
      ),
      priceRange: r.price_range,
      isFavorite: favoriteIds.has(r.id),
    }));

    return {
      pins,
      totalCount: pins.length,
    };
  }
}
