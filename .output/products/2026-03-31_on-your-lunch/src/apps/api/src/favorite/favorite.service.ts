import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: string, restaurantId: string) {
    // 기존 즐겨찾기 확인
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_restaurantId: {
          userId,
          restaurantId,
        },
      },
    });

    if (existing) {
      // 즐겨찾기 해제
      await this.prisma.favorite.delete({
        where: { id: existing.id },
      });
      return { restaurantId, isFavorite: false };
    }

    // 즐겨찾기 추가
    await this.prisma.favorite.create({
      data: { userId, restaurantId },
    });
    return { restaurantId, isFavorite: true };
  }
}
