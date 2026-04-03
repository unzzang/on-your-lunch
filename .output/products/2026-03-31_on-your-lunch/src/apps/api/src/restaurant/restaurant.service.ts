import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

// Haversine 공식으로 두 좌표 간 직선 거리(미터) 계산
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371000; // 지구 반경 (미터)
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** 직선 거리 → 도보 시간(분) 변환. 보정 계수 1.3, 분당 80m */
function distanceToWalkMinutes(distanceMeters: number): number {
  return Math.round((distanceMeters * 1.3) / 80);
}

@Injectable()
export class RestaurantService {
  constructor(private prisma: PrismaService) {}

  /** GET /restaurants/:id — 식당 상세 조회 */
  async findById(restaurantId: string, userId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        category: { select: { id: true, name: true, colorCode: true } },
        menus: {
          select: { id: true, name: true, price: true },
          orderBy: { sortOrder: 'asc' },
        },
        photos: {
          select: { id: true, imageUrl: true, isThumbnail: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!restaurant) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: '식당을 찾을 수 없습니다.' },
        HttpStatus.NOT_FOUND,
      );
    }

    // 사용자 위치 조회 (도보 시간 계산)
    const userLocation = await this.prisma.userLocation.findUnique({
      where: { userId },
    });

    let walkMinutes = 0;
    if (userLocation) {
      const dist = haversineDistance(
        Number(userLocation.latitude), Number(userLocation.longitude),
        Number(restaurant.latitude), Number(restaurant.longitude),
      );
      walkMinutes = distanceToWalkMinutes(dist);
    }

    // 즐겨찾기 여부
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_restaurantId: { userId, restaurantId } },
    });

    // 내 방문 이력
    const histories = await this.prisma.eatingHistory.findMany({
      where: { userId, restaurantId },
      orderBy: { eatenDate: 'desc' },
    });

    const myVisit = histories.length > 0
      ? {
          lastDate: histories[0].eatenDate,
          rating: Math.round(histories.reduce((sum, h) => sum + h.rating, 0) / histories.length),
          visitCount: histories.length,
        }
      : null;

    return {
      id: restaurant.id,
      name: restaurant.name,
      category: restaurant.category,
      address: restaurant.address,
      latitude: Number(restaurant.latitude),
      longitude: Number(restaurant.longitude),
      walkMinutes,
      phone: restaurant.phone,
      description: restaurant.description,
      priceRange: restaurant.priceRange,
      businessHours: restaurant.businessHours,
      thumbnailUrl: restaurant.thumbnailUrl,
      photos: restaurant.photos,
      menus: restaurant.menus,
      isFavorite: !!favorite,
      isClosed: restaurant.isClosed,
      myVisit,
    };
  }

  /** GET /restaurants/search — 식당 검색 */
  async search(query: string, page: number, limit: number, userId: string) {
    const userLocation = await this.prisma.userLocation.findUnique({
      where: { userId },
    });

    // 도보 15분 이내 (직선 거리 기준: 15 * 80 / 1.3 = 923m)
    const maxDistanceMeters = (15 * 80) / 1.3;

    // 식당명 + 메뉴명 검색
    const where: Prisma.RestaurantWhereInput = {
      isClosed: false,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { menus: { some: { name: { contains: query, mode: 'insensitive' } } } },
      ],
    };

    // 전체 후보 조회 (페이징 없이)
    const allRestaurants = await this.prisma.restaurant.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, colorCode: true } },
      },
    });

    // 거리 계산 + 필터링 (도보 15분 이내)
    const filtered = allRestaurants
      .map((r) => {
        let walkMinutes = 0;
        if (userLocation) {
          const dist = haversineDistance(
            Number(userLocation.latitude), Number(userLocation.longitude),
            Number(r.latitude), Number(r.longitude),
          );
          if (dist > maxDistanceMeters) return null;
          walkMinutes = distanceToWalkMinutes(dist);
        }
        return {
          id: r.id,
          name: r.name,
          category: r.category,
          walkMinutes,
          priceRange: r.priceRange,
          thumbnailUrl: r.thumbnailUrl,
          description: r.description,
          isClosed: r.isClosed,
        };
      })
      .filter(Boolean);

    // 거리 필터 후 정확한 totalCount + 수동 페이징
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit);
    const items = filtered.slice((page - 1) * limit, page * limit);

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

  /** GET /restaurants — 식당 탐색 리스트 */
  async findAll(
    categoryIds: string | undefined,
    priceRange: string | undefined,
    walkMinutes: number | undefined,
    sort: string,
    page: number,
    limit: number,
    favoritesOnly: boolean,
    userId: string,
  ) {
    const where: Prisma.RestaurantWhereInput = { isClosed: false };

    if (categoryIds) {
      where.categoryId = { in: categoryIds.split(',') };
    }

    if (priceRange) {
      where.priceRange = priceRange;
    }

    if (favoritesOnly) {
      const favs = await this.prisma.favorite.findMany({
        where: { userId },
        select: { restaurantId: true },
      });
      where.id = { in: favs.map((f) => f.restaurantId) };
    }

    // 전체 후보 조회 (페이징 없이)
    const allRestaurants = await this.prisma.restaurant.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, colorCode: true } },
      },
    });

    // 사용자 위치
    const userLocation = await this.prisma.userLocation.findUnique({ where: { userId } });

    // 거리 계산 + 필터링 (도보 시간 필터 포함)
    const walkMinutesLimit = walkMinutes ?? 15;
    const maxDistMeters = (walkMinutesLimit * 80) / 1.3;
    const filteredRestaurants = allRestaurants.filter((r) => {
      if (!userLocation) return true;
      const dist = haversineDistance(
        Number(userLocation.latitude), Number(userLocation.longitude),
        Number(r.latitude), Number(r.longitude),
      );
      return dist <= maxDistMeters;
    });

    // 즐겨찾기 ID 목록
    const favoriteIds = new Set(
      (await this.prisma.favorite.findMany({
        where: { userId },
        select: { restaurantId: true },
      })).map((f) => f.restaurantId),
    );

    // 내 방문 이력 (식당별 집계)
    const histories = await this.prisma.eatingHistory.findMany({
      where: { userId, restaurantId: { in: filteredRestaurants.map((r) => r.id) } },
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

    let allItems = filteredRestaurants.map((r) => {
      let walkMinutes = 0;
      if (userLocation) {
        const dist = haversineDistance(
          Number(userLocation.latitude), Number(userLocation.longitude),
          Number(r.latitude), Number(r.longitude),
        );
        walkMinutes = distanceToWalkMinutes(dist);
      }
      return {
        id: r.id,
        name: r.name,
        category: r.category,
        walkMinutes,
        priceRange: r.priceRange,
        thumbnailUrl: r.thumbnailUrl,
        description: r.description,
        isFavorite: favoriteIds.has(r.id),
        myVisit: visitMap.get(r.id) ?? null,
        isClosed: r.isClosed,
      };
    });

    // 정렬 (전체 데이터 대상)
    if (sort === 'distance') {
      allItems.sort((a, b) => a.walkMinutes - b.walkMinutes);
    } else if (sort === 'rating') {
      allItems.sort((a, b) => (b.myVisit?.rating ?? 0) - (a.myVisit?.rating ?? 0));
    }

    // 거리 필터 후 정확한 totalCount + 수동 페이징
    const totalCount = allItems.length;
    const totalPages = Math.ceil(totalCount / limit);
    const items = allItems.slice((page - 1) * limit, page * limit);

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

  /** GET /restaurants/map — 지도 영역 내 핀 */
  async findMapPins(
    swLat: number, swLng: number,
    neLat: number, neLng: number,
    categoryIds: string | undefined,
    userId: string,
  ) {
    const where: Prisma.RestaurantWhereInput = {
      isClosed: false,
      latitude: { gte: swLat, lte: neLat },
      longitude: { gte: swLng, lte: neLng },
    };

    if (categoryIds) {
      where.categoryId = { in: categoryIds.split(',') };
    }

    const restaurants = await this.prisma.restaurant.findMany({
      where,
      include: {
        category: { select: { colorCode: true } },
      },
    });

    // 사용자 위치 + 즐겨찾기
    const userLocation = await this.prisma.userLocation.findUnique({ where: { userId } });
    const favoriteIds = new Set(
      (await this.prisma.favorite.findMany({
        where: { userId },
        select: { restaurantId: true },
      })).map((f) => f.restaurantId),
    );

    const pins = restaurants.map((r) => {
      let walkMinutes = 0;
      if (userLocation) {
        const dist = haversineDistance(
          Number(userLocation.latitude), Number(userLocation.longitude),
          Number(r.latitude), Number(r.longitude),
        );
        walkMinutes = distanceToWalkMinutes(dist);
      }
      return {
        id: r.id,
        name: r.name,
        categoryColorCode: r.category.colorCode,
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        walkMinutes,
        priceRange: r.priceRange,
        isFavorite: favoriteIds.has(r.id),
      };
    });

    return {
      pins,
      totalCount: pins.length,
    };
  }
}
