import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShareService {
  constructor(private prisma: PrismaService) {}

  async getShareLink(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: '식당을 찾을 수 없습니다.' },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      shareUrl: `https://onyourlunch.kr/share/restaurant/${restaurant.id}`,
      deepLink: `onyourlunch://restaurant/${restaurant.id}`,
    };
  }
}
