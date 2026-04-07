import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PriceRange } from '@prisma/client';
import { calcWalkMinutes } from '../common/utils/geo.utils';

@Injectable()
export class RestaurantService {
  constructor(private prisma: PrismaService) {}

  async findById(restaurantId: string, userId: string) {
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

    const location = await this.prisma.userLocation.findUnique({
      where: { userId },
    });

    const favorite = await this.prisma.favorite.findFirst({
      where: { userId, restaurantId },
    });

    // 방문 이력 계산
    const histories = await this.prisma.eatingHistory.findMany({
      where: { userId, restaurantId },
      orderBy: { eatenDate: 'desc' },
    });

    let myVisit = null;
    if (histories.length > 0) {
      const avgRating = Math.round(
        histories.reduce((sum, h) => sum + h.rating, 0) / histories.length,
      );
      myVisit = {
        lastDate: histories[0].eatenDate.toISOString().split('T')[0],
        rating: avgRating,
        visitCount: histories.length,
      };
    }

    const walkMinutes = location
      ? calcWalkMinutes(
          Number(location.latitude),
          Number(location.longitude),
          Number(restaurant.latitude),
          Number(restaurant.longitude),
        )
      : 0;

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
      isFavorite: !!favorite,
      isClosed: restaurant.isClosed,
      myVisit,
    };
  }

  async findMany(
    userId: string,
    params: {
      categoryIds?: string;
      priceRange?: string;
      maxWalkMinutes?: number;
      sort?: string;
      page: number;
      limit: number;
      favoritesOnly: boolean;
    },
  ) {
    const location = await this.prisma.userLocation.findUnique({
      where: { userId },
    });

    const where: Prisma.RestaurantWhereInput = { isClosed: false };

    if (params.categoryIds) {
      where.categoryId = { in: params.categoryIds.split(',') };
    }

    if (params.priceRange) {
      where.priceRange = params.priceRange as PriceRange;
    }

    if (params.favoritesOnly) {
      const favIds = await this.prisma.favorite.findMany({
        where: { userId },
        select: { restaurantId: true },
      });
      where.id = { in: favIds.map((f) => f.restaurantId) };
    }

    const totalCount = await this.prisma.restaurant.count({ where });

    const restaurants = await this.prisma.restaurant.findMany({
      where,
      include: {
        category: true,
        favorites: { where: { userId } },
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    // 방문 이력 조회
    const restaurantIds = restaurants.map((r) => r.id);
    const histories = await this.prisma.eatingHistory.findMany({
      where: { userId, restaurantId: { in: restaurantIds } },
    });

    const visitMap = new Map<string, { ratingSum: number; count: number; lastDate: Date }>();
    for (const h of histories) {
      if (!h.restaurantId) continue;
      const existing = visitMap.get(h.restaurantId);
      if (existing) {
        existing.ratingSum += h.rating;
        existing.count++;
        if (h.eatenDate > existing.lastDate) {
          existing.lastDate = h.eatenDate;
        }
      } else {
        visitMap.set(h.restaurantId, { ratingSum: h.rating, count: 1, lastDate: h.eatenDate });
      }
    }

    const items = restaurants.map((r) => {
      const walkMinutes = location
        ? calcWalkMinutes(
            Number(location.latitude),
            Number(location.longitude),
            Number(r.latitude),
            Number(r.longitude),
          )
        : 0;

      const visit = visitMap.get(r.id);

      return {
        id: r.id,
        name: r.name,
        category: {
          id: r.category.id,
          name: r.category.name,
          colorCode: r.category.colorCode,
        },
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        walkMinutes,
        priceRange: r.priceRange,
        thumbnailUrl: r.thumbnailUrl,
        description: r.description,
        isFavorite: r.favorites.length > 0,
        myVisit: visit
          ? { lastDate: visit.lastDate.toISOString().split('T')[0], rating: Math.round(visit.ratingSum / visit.count), visitCount: visit.count }
          : null,
        isClosed: r.isClosed,
      };
    });

    // 도보 시간 필터 (Haversine 계산 후 필터)
    const filteredItems = params.maxWalkMinutes
      ? items.filter((item) => item.walkMinutes <= params.maxWalkMinutes!)
      : items;

    // 정렬
    if (params.sort === 'rating') {
      filteredItems.sort((a, b) => {
        const aRating = a.myVisit?.rating ?? 0;
        const bRating = b.myVisit?.rating ?? 0;
        return bRating - aRating;
      });
    } else {
      // 기본: 거리순 정렬
      filteredItems.sort((a, b) => a.walkMinutes - b.walkMinutes);
    }

    const filteredCount = params.maxWalkMinutes ? filteredItems.length : totalCount;
    const filteredPages = Math.ceil(filteredCount / params.limit);

    return {
      items: filteredItems,
      meta: {
        page: params.page,
        limit: params.limit,
        totalCount: filteredCount,
        totalPages: filteredPages,
        hasNext: params.page < filteredPages,
      },
    };
  }

  async search(
    userId: string,
    params: { q: string; page: number; limit: number },
  ) {
    const where: Prisma.RestaurantWhereInput = {
      isClosed: false,
      name: { contains: params.q, mode: 'insensitive' },
    };

    const totalCount = await this.prisma.restaurant.count({ where });
    const totalPages = Math.ceil(totalCount / params.limit);

    const restaurants = await this.prisma.restaurant.findMany({
      where,
      include: {
        category: true,
        favorites: { where: { userId } },
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    const location = await this.prisma.userLocation.findUnique({
      where: { userId },
    });

    // 방문 이력 조회
    const restaurantIds = restaurants.map((r) => r.id);
    const histories = await this.prisma.eatingHistory.findMany({
      where: { userId, restaurantId: { in: restaurantIds } },
    });

    const visitMap = new Map<string, { ratingSum: number; count: number; lastDate: Date }>();
    for (const h of histories) {
      if (!h.restaurantId) continue;
      const existing = visitMap.get(h.restaurantId);
      if (existing) {
        existing.ratingSum += h.rating;
        existing.count++;
        if (h.eatenDate > existing.lastDate) {
          existing.lastDate = h.eatenDate;
        }
      } else {
        visitMap.set(h.restaurantId, { ratingSum: h.rating, count: 1, lastDate: h.eatenDate });
      }
    }

    const items = restaurants.map((r) => {
      const walkMinutes = location
        ? calcWalkMinutes(
            Number(location.latitude),
            Number(location.longitude),
            Number(r.latitude),
            Number(r.longitude),
          )
        : 0;

      const visit = visitMap.get(r.id);

      return {
        id: r.id,
        name: r.name,
        category: {
          id: r.category.id,
          name: r.category.name,
          colorCode: r.category.colorCode,
        },
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        walkMinutes,
        priceRange: r.priceRange,
        thumbnailUrl: r.thumbnailUrl,
        description: r.description,
        isFavorite: r.favorites.length > 0,
        myVisit: visit
          ? { lastDate: visit.lastDate.toISOString().split('T')[0], rating: Math.round(visit.ratingSum / visit.count), visitCount: visit.count }
          : null,
        isClosed: r.isClosed,
      };
    });

    return {
      items,
      meta: {
        page: params.page,
        limit: params.limit,
        totalCount,
        totalPages,
        hasNext: params.page < totalPages,
      },
    };
  }

  async findMapPins(
    userId: string,
    params: {
      swLat: number;
      swLng: number;
      neLat: number;
      neLng: number;
      categoryIds?: string;
      priceRange?: string;
    },
  ) {
    const where: Prisma.RestaurantWhereInput = {
      isClosed: false,
      latitude: { gte: params.swLat, lte: params.neLat },
      longitude: { gte: params.swLng, lte: params.neLng },
    };

    if (params.categoryIds) {
      where.categoryId = { in: params.categoryIds.split(',') };
    }

    if (params.priceRange) {
      where.priceRange = params.priceRange as PriceRange;
    }

    const restaurants = await this.prisma.restaurant.findMany({
      where,
      include: {
        category: true,
        favorites: { where: { userId } },
      },
    });

    const location = await this.prisma.userLocation.findUnique({
      where: { userId },
    });

    const pins = restaurants.map((r) => {
      const walkMinutes = location
        ? calcWalkMinutes(
            Number(location.latitude),
            Number(location.longitude),
            Number(r.latitude),
            Number(r.longitude),
          )
        : 0;

      return {
        id: r.id,
        name: r.name,
        categoryColorCode: r.category.colorCode,
        categoryName: r.category.name,
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        walkMinutes,
        priceRange: r.priceRange,
        isFavorite: r.favorites.length > 0,
      };
    });

    return { pins, totalCount: pins.length };
  }
}
