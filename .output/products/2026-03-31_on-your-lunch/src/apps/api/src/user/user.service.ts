import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  NOTIFICATION_TIMES,
  NICKNAME_MIN_LENGTH,
  NICKNAME_MAX_LENGTH,
} from '@shared-types';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 내 정보 조회 — 사용자 정보 + 위치 + 취향 + 알림 설정
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        location: true,
        preferredCategories: { include: { category: true } },
        excludedCategories: { include: { category: true } },
        allergies: { include: { allergyType: true } },
      },
    });

    if (!user) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: '사용자를 찾을 수 없습니다.' },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileImageUrl: user.profileImageUrl,
      location: user.location
        ? {
            latitude: Number(user.location.latitude),
            longitude: Number(user.location.longitude),
            address: user.location.address,
            buildingName: user.location.buildingName,
          }
        : null,
      preferences:
        user.preferredCategories.length > 0 ||
        user.excludedCategories.length > 0 ||
        user.allergies.length > 0
          ? {
              preferredCategories: user.preferredCategories.map((pc) => ({
                id: pc.category.id,
                name: pc.category.name,
              })),
              excludedCategories: user.excludedCategories.map((ec) => ({
                id: ec.category.id,
                name: ec.category.name,
              })),
              allergies: user.allergies.map((a) => ({
                id: a.allergyType.id,
                name: a.allergyType.name,
              })),
              preferredPriceRange: user.preferredPriceRange,
            }
          : null,
      notification: {
        enabled: user.notificationEnabled,
        time: user.notificationTime,
      },
      marketingAgreed: user.marketingAgreed,
      isOnboardingCompleted: user.isOnboardingCompleted,
      createdAt: user.createdAt.toISOString(),
    };
  }

  /**
   * 회사 위치 설정/변경 — upsert
   */
  async updateLocation(
    userId: string,
    data: { latitude: number; longitude: number; address: string; buildingName?: string },
  ) {
    const location = await this.prisma.userLocation.upsert({
      where: { userId },
      create: {
        userId,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        buildingName: data.buildingName || null,
      },
      update: {
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        buildingName: data.buildingName || null,
      },
    });

    return {
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      address: location.address,
      buildingName: location.buildingName,
    };
  }

  /**
   * 취향 설정 — 기존 데이터를 삭제한 후 새로 생성 (replace 방식)
   */
  async updatePreferences(
    userId: string,
    data: {
      preferredCategoryIds: string[];
      excludedCategoryIds: string[];
      allergyTypeIds: string[];
      preferredPriceRange: string;
    },
  ) {
    // 유효한 가격대인지 검증
    const validPriceRanges = ['UNDER_10K', 'BETWEEN_10K_20K', 'OVER_20K'];
    if (!validPriceRanges.includes(data.preferredPriceRange)) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '유효하지 않은 가격대입니다.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 트랜잭션으로 일괄 처리
    await this.prisma.$transaction(async (tx) => {
      // 기존 취향 데이터 삭제
      await tx.userPreferredCategory.deleteMany({ where: { userId } });
      await tx.userExcludedCategory.deleteMany({ where: { userId } });
      await tx.userAllergy.deleteMany({ where: { userId } });

      // 선호 카테고리 생성
      if (data.preferredCategoryIds.length > 0) {
        await tx.userPreferredCategory.createMany({
          data: data.preferredCategoryIds.map((categoryId) => ({
            userId,
            categoryId,
          })),
        });
      }

      // 제외 카테고리 생성
      if (data.excludedCategoryIds.length > 0) {
        await tx.userExcludedCategory.createMany({
          data: data.excludedCategoryIds.map((categoryId) => ({
            userId,
            categoryId,
          })),
        });
      }

      // 알레르기 생성
      if (data.allergyTypeIds.length > 0) {
        await tx.userAllergy.createMany({
          data: data.allergyTypeIds.map((allergyTypeId) => ({
            userId,
            allergyTypeId,
          })),
        });
      }

      // 선호 가격대 업데이트
      await tx.user.update({
        where: { id: userId },
        data: { preferredPriceRange: data.preferredPriceRange },
      });
    });

    // 업데이트된 데이터 조회하여 반환
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferredCategories: { include: { category: true } },
        excludedCategories: { include: { category: true } },
        allergies: { include: { allergyType: true } },
      },
    });

    return {
      preferredCategories: user!.preferredCategories.map((pc) => ({
        id: pc.category.id,
        name: pc.category.name,
      })),
      excludedCategories: user!.excludedCategories.map((ec) => ({
        id: ec.category.id,
        name: ec.category.name,
      })),
      allergies: user!.allergies.map((a) => ({
        id: a.allergyType.id,
        name: a.allergyType.name,
      })),
      preferredPriceRange: user!.preferredPriceRange,
    };
  }

  /**
   * 온보딩 완료 — 위치 + 취향이 모두 설정되어 있는지 검증
   */
  async completeOnboarding(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        location: true,
        preferredCategories: true,
      },
    });

    if (!user) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: '사용자를 찾을 수 없습니다.' },
        HttpStatus.NOT_FOUND,
      );
    }

    // 위치 설정 여부 검증
    if (!user.location) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '회사 위치를 먼저 설정해주세요.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 취향 설정 여부 검증 (선호 카테고리가 1개 이상)
    if (user.preferredCategories.length === 0) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '취향을 먼저 설정해주세요.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isOnboardingCompleted: true },
    });

    return { isOnboardingCompleted: true };
  }

  /**
   * 프로필 수정 — 닉네임 유효성 검증(2~10자, 한글/영문/숫자)
   */
  async updateProfile(userId: string, data: { nickname?: string }) {
    if (data.nickname !== undefined) {
      // 길이 검증
      if (
        data.nickname.length < NICKNAME_MIN_LENGTH ||
        data.nickname.length > NICKNAME_MAX_LENGTH
      ) {
        throw new HttpException(
          {
            code: 'VALIDATION_ERROR',
            message: `닉네임은 ${NICKNAME_MIN_LENGTH}~${NICKNAME_MAX_LENGTH}자여야 합니다.`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // 한글/영문/숫자만 허용
      const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/;
      if (!nicknameRegex.test(data.nickname)) {
        throw new HttpException(
          {
            code: 'VALIDATION_ERROR',
            message: '닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.nickname && { nickname: data.nickname }),
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      nickname: updatedUser.nickname,
      profileImageUrl: updatedUser.profileImageUrl,
    };
  }

  /**
   * 알림 설정 변경 — 시간 유효성 검증
   */
  async updateNotification(userId: string, data: { enabled: boolean; time: string }) {
    // 허용된 알림 시간인지 검증
    if (!NOTIFICATION_TIMES.includes(data.time as any)) {
      throw new HttpException(
        {
          code: 'VALIDATION_ERROR',
          message: `알림 시간은 ${NOTIFICATION_TIMES.join(', ')} 중 하나여야 합니다.`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        notificationEnabled: data.enabled,
        notificationTime: data.time,
      },
    });

    return {
      enabled: data.enabled,
      time: data.time,
    };
  }

  /**
   * 푸시 토큰 등록
   */
  async updatePushToken(userId: string, expoPushToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { expoPushToken },
    });
    return { expoPushToken };
  }

  /**
   * 회원 탈퇴 — 소프트 삭제 + 연관 데이터 처리 (ERD 4. 소프트 삭제 전략)
   * 1. USER.deleted_at 설정
   * 2. USER_LOCATION, 선호/제외 카테고리, 알레르기 → 즉시 삭제
   * 3. EATING_HISTORY, FAVORITE → 즉시 삭제
   * 4. RECOMMENDATION_LOG → 익명화 (user_id를 NULL로 변경)
   */
  async deleteAccount(userId: string) {
    await this.prisma.$transaction(async (tx) => {
      // 연관 데이터 즉시 삭제
      await tx.userLocation.deleteMany({ where: { userId } });
      await tx.userPreferredCategory.deleteMany({ where: { userId } });
      await tx.userExcludedCategory.deleteMany({ where: { userId } });
      await tx.userAllergy.deleteMany({ where: { userId } });
      await tx.eatingHistory.deleteMany({ where: { userId } });
      await tx.favorite.deleteMany({ where: { userId } });

      // RECOMMENDATION_LOG 익명화 (user_id를 NULL로 변경)
      await tx.recommendationLog.updateMany({
        where: { userId },
        data: { userId: null },
      });

      // 소프트 삭제
      await tx.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          refreshToken: null,
          expoPushToken: null,
        },
      });
    });

    return null;
  }
}
