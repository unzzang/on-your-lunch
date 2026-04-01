import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RATING_MIN, RATING_MAX, MEMO_MAX_LENGTH } from '@shared-types';

@Injectable()
export class EatingHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 먹었어요 기록 — 식당 ID 기반
   */
  async create(
    userId: string,
    data: {
      restaurantId: string;
      eatenDate: string;
      rating: number;
      memo?: string;
      isFromRecommendation: boolean;
    },
  ) {
    // 별점 범위 검증
    if (data.rating < RATING_MIN || data.rating > RATING_MAX) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: `별점은 ${RATING_MIN}~${RATING_MAX} 사이여야 합니다.` },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 메모 길이 검증
    if (data.memo && data.memo.length > MEMO_MAX_LENGTH) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: `메모는 최대 ${MEMO_MAX_LENGTH}자입니다.` },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 날짜 검증: 당일 또는 최대 7일 전
    const eatenDate = new Date(data.eatenDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    if (eatenDate > today) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '미래 날짜는 기록할 수 없습니다.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (eatenDate < sevenDaysAgo) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '7일 이전의 기록은 추가할 수 없습니다.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 식당 존재 확인
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
      include: { category: true },
    });

    if (!restaurant) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: '식당을 찾을 수 없습니다.' },
        HttpStatus.NOT_FOUND,
      );
    }

    // 같은 날 같은 식당 중복 체크
    const existing = await this.prisma.eatingHistory.findFirst({
      where: {
        userId,
        restaurantId: data.restaurantId,
        eatenDate: eatenDate,
      },
    });

    if (existing) {
      throw new HttpException(
        { code: 'DUPLICATE', message: '같은 날 같은 식당의 기록이 이미 있습니다.' },
        HttpStatus.CONFLICT,
      );
    }

    // 먹은 이력 생성
    const history = await this.prisma.eatingHistory.create({
      data: {
        userId,
        restaurantId: data.restaurantId,
        eatenDate: eatenDate,
        rating: data.rating,
        memo: data.memo || null,
        isFromRecommendation: data.isFromRecommendation,
      },
    });

    return {
      id: history.id,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        category: { name: restaurant.category.name },
      },
      eatenDate: data.eatenDate,
      rating: history.rating,
      memo: history.memo,
      isFromRecommendation: history.isFromRecommendation,
      createdAt: history.createdAt.toISOString(),
    };
  }

  /**
   * DB에 없는 식당 직접 기록 — 식당 생성 후 이력 연결
   */
  async createCustom(
    userId: string,
    data: {
      restaurantName: string;
      categoryId: string;
      eatenDate: string;
      rating: number;
      memo?: string;
    },
  ) {
    // 별점 범위 검증
    if (data.rating < RATING_MIN || data.rating > RATING_MAX) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: `별점은 ${RATING_MIN}~${RATING_MAX} 사이여야 합니다.` },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 날짜 검증
    const eatenDate = new Date(data.eatenDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    if (eatenDate > today || eatenDate < sevenDaysAgo) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '당일~7일 전까지만 기록할 수 있습니다.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 카테고리 존재 확인
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: '카테고리를 찾을 수 없습니다.' },
        HttpStatus.NOT_FOUND,
      );
    }

    // 사용자 위치 조회 (직접 입력 식당의 좌표로 사용)
    const userLocation = await this.prisma.userLocation.findUnique({
      where: { userId },
    });

    // 트랜잭션: 식당 생성 + 이력 생성
    const result = await this.prisma.$transaction(async (tx) => {
      // 사용자 직접 입력 식당 생성
      const restaurant = await tx.restaurant.create({
        data: {
          name: data.restaurantName,
          categoryId: data.categoryId,
          address: '사용자 직접 입력',
          latitude: userLocation ? userLocation.latitude : 0,
          longitude: userLocation ? userLocation.longitude : 0,
          isUserCreated: true,
          dataSource: 'USER',
        },
      });

      // 먹은 이력 생성
      const history = await tx.eatingHistory.create({
        data: {
          userId,
          restaurantId: restaurant.id,
          eatenDate: eatenDate,
          rating: data.rating,
          memo: data.memo || null,
          isFromRecommendation: false,
        },
      });

      return { restaurant, history };
    });

    return {
      id: result.history.id,
      restaurant: {
        id: result.restaurant.id,
        name: result.restaurant.name,
        category: { name: category.name },
      },
      eatenDate: data.eatenDate,
      rating: result.history.rating,
      memo: result.history.memo,
      isFromRecommendation: false,
      createdAt: result.history.createdAt.toISOString(),
    };
  }

  /**
   * 먹은 이력 캘린더 조회 (월별) — 날짜별 그룹핑
   */
  async getCalendar(userId: string, year: number, month: number) {
    // 해당 월의 시작/종료 날짜
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // 해당 월 마지막 날

    const histories = await this.prisma.eatingHistory.findMany({
      where: {
        userId,
        eatenDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        restaurant: {
          include: { category: true },
        },
        manualCategory: true,
      },
      orderBy: { eatenDate: 'asc' },
    });

    // 날짜별 그룹핑
    const dayMap = new Map<
      string,
      Array<{
        id: string;
        restaurant: { id: string; name: string };
        category: { id: string; name: string; colorCode: string };
        rating: number;
        memo: string | null;
      }>
    >();

    for (const h of histories) {
      const dateStr =
        h.eatenDate instanceof Date
          ? h.eatenDate.toISOString().split('T')[0]
          : String(h.eatenDate);

      if (!dayMap.has(dateStr)) {
        dayMap.set(dateStr, []);
      }

      const restaurantName = h.restaurant
        ? h.restaurant.name
        : h.manualRestaurantName || '알 수 없음';
      const restaurantId = h.restaurant ? h.restaurant.id : h.id;
      const category = h.restaurant
        ? h.restaurant.category
        : h.manualCategory;

      dayMap.get(dateStr)!.push({
        id: h.id,
        restaurant: { id: restaurantId, name: restaurantName },
        category: {
          id: category?.id || '',
          name: category?.name || '기타',
          colorCode: category?.colorCode || '#999999',
        },
        rating: h.rating,
        memo: h.memo,
      });
    }

    // 배열로 변환 (기록 없는 날짜는 포함하지 않음)
    const days = Array.from(dayMap.entries()).map(([date, records]) => ({
      date,
      records,
    }));

    return {
      year,
      month,
      days,
    };
  }

  /**
   * 먹은 이력 수정 — 본인 이력만 수정 가능
   */
  async update(userId: string, id: string, data: { rating?: number; memo?: string }) {
    // 본인 이력 확인
    const history = await this.prisma.eatingHistory.findFirst({
      where: { id, userId },
      include: {
        restaurant: { include: { category: true } },
      },
    });

    if (!history) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: '먹은 이력을 찾을 수 없습니다.' },
        HttpStatus.NOT_FOUND,
      );
    }

    // 별점 범위 검증
    if (data.rating !== undefined && (data.rating < RATING_MIN || data.rating > RATING_MAX)) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: `별점은 ${RATING_MIN}~${RATING_MAX} 사이여야 합니다.` },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 메모 길이 검증
    if (data.memo !== undefined && data.memo.length > MEMO_MAX_LENGTH) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: `메모는 최대 ${MEMO_MAX_LENGTH}자입니다.` },
        HttpStatus.BAD_REQUEST,
      );
    }

    const updated = await this.prisma.eatingHistory.update({
      where: { id },
      data: {
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.memo !== undefined && { memo: data.memo }),
      },
      include: {
        restaurant: { include: { category: true } },
      },
    });

    const dateStr =
      updated.eatenDate instanceof Date
        ? updated.eatenDate.toISOString().split('T')[0]
        : String(updated.eatenDate);

    return {
      id: updated.id,
      restaurant: updated.restaurant
        ? {
            id: updated.restaurant.id,
            name: updated.restaurant.name,
            category: { name: updated.restaurant.category.name },
          }
        : {
            id: updated.id,
            name: updated.manualRestaurantName || '알 수 없음',
            category: { name: '기타' },
          },
      eatenDate: dateStr,
      rating: updated.rating,
      memo: updated.memo,
      isFromRecommendation: updated.isFromRecommendation,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  /**
   * 먹은 이력 삭제 — 본인 이력만, 즉시 삭제 (소프트 삭제 아님)
   */
  async delete(userId: string, id: string) {
    // 본인 이력 확인
    const history = await this.prisma.eatingHistory.findFirst({
      where: { id, userId },
    });

    if (!history) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: '먹은 이력을 찾을 수 없습니다.' },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.eatingHistory.delete({
      where: { id },
    });

    return null;
  }
}
