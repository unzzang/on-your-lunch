import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateEatingHistoryDto,
  CreateCustomEatingHistoryDto,
  UpdateEatingHistoryDto,
} from './dto/create-eating-history.dto';

@Injectable()
export class EatingHistoryService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateEatingHistoryDto) {
    // 날짜 검증: 7일 이전은 불가
    const eatenDate = new Date(dto.eatenDate);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    if (eatenDate < sevenDaysAgo) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '7일 이전의 기록은 저장할 수 없습니다.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 중복 검증
    const existing = await this.prisma.eatingHistory.findFirst({
      where: {
        userId,
        restaurantId: dto.restaurantId,
        eatenDate,
      },
    });

    if (existing) {
      throw new HttpException(
        { code: 'DUPLICATE', message: '같은 날 같은 식당의 기록이 이미 존재합니다.' },
        HttpStatus.CONFLICT,
      );
    }

    const history = await this.prisma.eatingHistory.create({
      data: {
        userId,
        restaurantId: dto.restaurantId,
        eatenDate,
        rating: dto.rating,
        memo: dto.memo ?? null,
        isFromRecommendation: dto.isFromRecommendation,
      },
      include: {
        restaurant: {
          include: { category: true },
        },
      },
    });

    return {
      id: history.id,
      restaurant: history.restaurant
        ? {
            id: history.restaurant.id,
            name: history.restaurant.name,
            category: { name: history.restaurant.category.name, colorCode: history.restaurant.category.colorCode },
          }
        : null,
      eatenDate: history.eatenDate.toISOString().split('T')[0],
      rating: history.rating,
      memo: history.memo,
      isFromRecommendation: history.isFromRecommendation,
      createdAt: history.createdAt.toISOString(),
    };
  }

  async createCustom(userId: string, dto: CreateCustomEatingHistoryDto) {
    const eatenDate = new Date(dto.eatenDate);

    // 날짜 검증: 7일 이전은 불가
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    if (eatenDate < sevenDaysAgo) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '7일 이전의 기록은 저장할 수 없습니다.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 카테고리 존재 확인
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: '카테고리를 찾을 수 없습니다.' },
        HttpStatus.NOT_FOUND,
      );
    }

    // 스키마 의도대로 manualRestaurantName, manualCategoryId 사용
    const history = await this.prisma.eatingHistory.create({
      data: {
        userId,
        manualRestaurantName: dto.restaurantName,
        manualCategoryId: dto.categoryId,
        eatenDate,
        rating: dto.rating,
        memo: dto.memo ?? null,
        isFromRecommendation: false,
      },
    });

    return {
      id: history.id,
      restaurant: {
        id: null,
        name: dto.restaurantName,
        category: { name: category.name, colorCode: category.colorCode },
      },
      eatenDate: history.eatenDate.toISOString().split('T')[0],
      rating: history.rating,
      memo: history.memo,
      isFromRecommendation: history.isFromRecommendation,
      createdAt: history.createdAt.toISOString(),
    };
  }

  async update(userId: string, historyId: string, dto: UpdateEatingHistoryDto) {
    const history = await this.prisma.eatingHistory.findFirst({
      where: { id: historyId, userId },
    });

    if (!history) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: '기록을 찾을 수 없습니다.' },
        HttpStatus.NOT_FOUND,
      );
    }

    const data: Record<string, number | string | null> = {};
    if (dto.rating !== undefined) data.rating = dto.rating;
    if (dto.memo !== undefined) data.memo = dto.memo;

    const updated = await this.prisma.eatingHistory.update({
      where: { id: historyId },
      data,
      include: {
        restaurant: { include: { category: true } },
      },
    });

    return {
      id: updated.id,
      restaurant: updated.restaurant
        ? {
            id: updated.restaurant.id,
            name: updated.restaurant.name,
            category: { name: updated.restaurant.category.name, colorCode: updated.restaurant.category.colorCode },
          }
        : null,
      eatenDate: updated.eatenDate.toISOString().split('T')[0],
      rating: updated.rating,
      memo: updated.memo,
      isFromRecommendation: updated.isFromRecommendation,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async delete(userId: string, historyId: string) {
    const history = await this.prisma.eatingHistory.findFirst({
      where: { id: historyId, userId },
    });

    if (!history) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: '기록을 찾을 수 없습니다.' },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.eatingHistory.delete({ where: { id: historyId } });
    return null;
  }

  async getCalendar(userId: string, year: number, month: number) {
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: 'year와 month는 유효한 숫자여야 합니다 (month: 1~12).' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const histories = await this.prisma.eatingHistory.findMany({
      where: {
        userId,
        eatenDate: { gte: startDate, lte: endDate },
      },
      include: {
        restaurant: { include: { category: true } },
      },
      orderBy: { eatenDate: 'asc' },
    });

    // 수동 입력 카테고리 조회
    const manualCategoryIds = histories
      .filter((h) => !h.restaurant && h.manualCategoryId)
      .map((h) => h.manualCategoryId!);
    const manualCategories = manualCategoryIds.length > 0
      ? await this.prisma.category.findMany({ where: { id: { in: manualCategoryIds } } })
      : [];
    const categoryMap = new Map(manualCategories.map((c) => [c.id, c]));

    // 날짜별 그룹핑
    const dayMap = new Map<string, {
      id: string;
      restaurant: { id: string | null; name: string; thumbnailUrl: string | null };
      category: { name: string; colorCode: string };
      rating: number;
      memo: string | null;
    }[]>();

    for (const h of histories) {
      const dateStr = h.eatenDate.toISOString().split('T')[0];
      if (!dayMap.has(dateStr)) {
        dayMap.set(dateStr, []);
      }

      const manualCat = h.manualCategoryId ? categoryMap.get(h.manualCategoryId) : null;
      const categoryName = h.restaurant
        ? h.restaurant.category.name
        : manualCat?.name ?? '기타';
      const colorCode = h.restaurant
        ? h.restaurant.category.colorCode
        : manualCat?.colorCode ?? '#999999';

      dayMap.get(dateStr)!.push({
        id: h.id,
        restaurant: {
          id: h.restaurant?.id ?? null,
          name: h.restaurant?.name ?? h.manualRestaurantName ?? '직접 입력',
          thumbnailUrl: h.restaurant?.thumbnailUrl ?? null,
        },
        category: { name: categoryName, colorCode },
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
