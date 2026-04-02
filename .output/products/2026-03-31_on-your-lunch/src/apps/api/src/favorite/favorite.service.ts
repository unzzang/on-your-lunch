import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private prisma: PrismaService) {}

  /** POST /favorites/toggle — 즐겨찾기 토글 */
  async toggle(userId: string, restaurantId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_restaurantId: { userId, restaurantId } },
    });

    if (existing) {
      // 이미 즐겨찾기 → 해제
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
