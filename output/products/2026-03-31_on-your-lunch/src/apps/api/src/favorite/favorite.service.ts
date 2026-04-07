import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        restaurant: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: favorites.map((f) => ({
        id: f.id,
        createdAt: f.createdAt.toISOString(),
        restaurant: {
          id: f.restaurant.id,
          name: f.restaurant.name,
          category: {
            id: f.restaurant.category.id,
            name: f.restaurant.category.name,
            colorCode: f.restaurant.category.colorCode,
          },
          thumbnailUrl: f.restaurant.thumbnailUrl,
          priceRange: f.restaurant.priceRange,
          isClosed: f.restaurant.isClosed,
        },
      })),
      totalCount: favorites.length,
    };
  }

  async toggle(userId: string, restaurantId: string) {
    const existing = await this.prisma.favorite.findFirst({
      where: { userId, restaurantId },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { restaurantId, isFavorite: false };
    }

    // 식당 존재 여부 확인
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: '식당을 찾을 수 없습니다.' },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.favorite.create({
      data: { userId, restaurantId },
    });
    return { restaurantId, isFavorite: true };
  }
}
