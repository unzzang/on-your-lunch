import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DataSource } from '@prisma/client';

@Injectable()
export class EatingHistoryService {
  constructor(private prisma: PrismaService) {}

  /** POST /eating-histories — 먹었어요 기록 */
  async create(
    userId: string,
    restaurantId: string,
    eatenDate: string,
    rating: number,
    memo: string | undefined,
    isFromRecommendation: boolean,
  ) {
    const date = new Date(eatenDate);

    // 7일 이전 날짜 검증
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    if (date < sevenDaysAgo) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '7일 이전 날짜는 기록할 수 없습니다.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 식당 존재 여부
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { category: { select: { name: true } } },
    });
    if (!restaurant) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: '식당을 찾을 수 없습니다.' },
        HttpStatus.NOT_FOUND,
      );
    }

    // 같은 날 같은 식당 중복 체크
    const existing = await this.prisma.eatingHistory.findFirst({
      where: { userId, restaurantId, eatenDate: date },
    });
    if (existing) {
      throw new HttpException(
        { code: 'DUPLICATE', message: '같은 날 같은 식당은 이미 기록되어 있습니다.' },
        HttpStatus.CONFLICT,
      );
    }

    const history = await this.prisma.eatingHistory.create({
      data: {
        userId,
        restaurantId,
        eatenDate: date,
        rating,
        memo,
        isFromRecommendation,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    return {
      id: history.id,
      restaurant: {
        id: history.restaurant!.id,
        name: history.restaurant!.name,
        category: { name: history.restaurant!.category.name },
      },
      eatenDate: history.eatenDate,
      rating: history.rating,
      memo: history.memo,
      isFromRecommendation: history.isFromRecommendation,
      createdAt: history.createdAt,
    };
  }

  /** POST /eating-histories/custom — 직접 입력 식당 기록 */
  async createCustom(
    userId: string,
    restaurantName: string,
    categoryId: string,
    eatenDate: string,
    rating: number,
    memo: string | undefined,
  ) {
    const date = new Date(eatenDate);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    if (date < sevenDaysAgo) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '7일 이전 날짜는 기록할 수 없습니다.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 사용자 위치 가져오기 (식당 생성에 필요)
    const userLocation = await this.prisma.userLocation.findUnique({
      where: { userId },
    });

    // 식당 생성 (is_user_created: true, data_source: USER)
    const restaurant = await this.prisma.restaurant.create({
      data: {
        name: restaurantName,
        categoryId,
        address: '직접 입력',
        latitude: userLocation ? userLocation.latitude : 0,
        longitude: userLocation ? userLocation.longitude : 0,
        isUserCreated: true,
        dataSource: DataSource.USER,
      },
      include: { category: { select: { name: true } } },
    });

    // 먹은 이력 생성
    const history = await this.prisma.eatingHistory.create({
      data: {
        userId,
        restaurantId: restaurant.id,
        eatenDate: date,
        rating,
        memo,
        isFromRecommendation: false,
      },
    });

    return {
      id: history.id,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        category: { name: restaurant.category.name },
      },
      eatenDate: history.eatenDate,
      rating: history.rating,
      memo: history.memo,
      isFromRecommendation: false,
      createdAt: history.createdAt,
    };
  }

  /** PATCH /eating-histories/:id — 수정 */
  async update(
    historyId: string,
    userId: string,
    rating: number | undefined,
    memo: string | undefined,
  ) {
    const history = await this.prisma.eatingHistory.findUnique({
      where: { id: historyId },
    });

    if (!history || history.userId !== userId) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: '이력을 찾을 수 없습니다.' },
        HttpStatus.NOT_FOUND,
      );
    }

    const data: Record<string, any> = {};
    if (rating !== undefined) data.rating = rating;
    if (memo !== undefined) data.memo = memo;

    const updated = await this.prisma.eatingHistory.update({
      where: { id: historyId },
      data,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    return {
      id: updated.id,
      restaurant: updated.restaurant
        ? {
            id: updated.restaurant.id,
            name: updated.restaurant.name,
            category: { name: updated.restaurant.category.name },
          }
        : null,
      eatenDate: updated.eatenDate,
      rating: updated.rating,
      memo: updated.memo,
      isFromRecommendation: updated.isFromRecommendation,
      createdAt: updated.createdAt,
    };
  }

  /** DELETE /eating-histories/:id — 삭제 */
  async delete(historyId: string, userId: string) {
    const history = await this.prisma.eatingHistory.findUnique({
      where: { id: historyId },
    });

    if (!history || history.userId !== userId) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: '이력을 찾을 수 없습니다.' },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.eatingHistory.delete({ where: { id: historyId } });
    return null;
  }

  /** GET /eating-histories/calendar — 캘린더 조회 (월별) */
  async getCalendar(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // 해당 월의 마지막 날

    const histories = await this.prisma.eatingHistory.findMany({
      where: {
        userId,
        eatenDate: { gte: startDate, lte: endDate },
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            category: { select: { name: true, colorCode: true } },
          },
        },
      },
      orderBy: { eatenDate: 'asc' },
    });

    // 날짜별 그룹핑
    const dayMap = new Map<string, Array<any>>();
    for (const h of histories) {
      const dateStr = h.eatenDate.toISOString().split('T')[0];
      if (!dayMap.has(dateStr)) {
        dayMap.set(dateStr, []);
      }
      dayMap.get(dateStr)!.push({
        id: h.id,
        restaurant: h.restaurant
          ? { id: h.restaurant.id, name: h.restaurant.name }
          : { id: null, name: h.manualRestaurantName },
        category: h.restaurant
          ? { name: h.restaurant.category.name, colorCode: h.restaurant.category.colorCode }
          : { name: '기타', colorCode: '#999999' },
        rating: h.rating,
        memo: h.memo,
      });
    }

    const days = Array.from(dayMap.entries()).map(([date, records]) => ({
      date,
      records,
    }));

    return { year, month, days };
  }
}
