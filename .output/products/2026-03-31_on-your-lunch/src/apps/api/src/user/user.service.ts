import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { UpdatePushTokenDto } from './dto/update-push-token.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /** PUT /users/me/location — 회사 위치 설정/변경 */
  async updateLocation(userId: string, dto: UpdateLocationDto) {
    const existing = await this.prisma.userLocation.findUnique({
      where: { userId },
    });

    if (existing) {
      return this.prisma.userLocation.update({
        where: { userId },
        data: {
          latitude: dto.latitude,
          longitude: dto.longitude,
          address: dto.address,
          buildingName: dto.buildingName ?? null,
        },
        select: { latitude: true, longitude: true, address: true, buildingName: true },
      });
    }

    return this.prisma.userLocation.create({
      data: {
        userId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        buildingName: dto.buildingName ?? null,
      },
      select: { latitude: true, longitude: true, address: true, buildingName: true },
    });
  }

  /** PUT /users/me/preferences — 취향 설정/변경 */
  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    // 트랜잭션으로 선호/제외/알레르기를 한번에 교체
    await this.prisma.$transaction(async (tx) => {
      // 기존 데이터 삭제
      await tx.userPreferredCategory.deleteMany({ where: { userId } });
      await tx.userExcludedCategory.deleteMany({ where: { userId } });
      await tx.userAllergy.deleteMany({ where: { userId } });

      // 선호 카테고리 생성
      if (dto.preferredCategoryIds?.length) {
        await tx.userPreferredCategory.createMany({
          data: dto.preferredCategoryIds.map((categoryId) => ({ userId, categoryId })),
        });
      }

      // 제외 카테고리 생성
      if (dto.excludedCategoryIds?.length) {
        await tx.userExcludedCategory.createMany({
          data: dto.excludedCategoryIds.map((categoryId) => ({ userId, categoryId })),
        });
      }

      // 알레르기 생성
      if (dto.allergyTypeIds?.length) {
        await tx.userAllergy.createMany({
          data: dto.allergyTypeIds.map((allergyTypeId) => ({ userId, allergyTypeId })),
        });
      }

      // 가격대 업데이트
      if (dto.preferredPriceRange) {
        await tx.user.update({
          where: { id: userId },
          data: { preferredPriceRange: dto.preferredPriceRange },
        });
      }
    });

    // 업데이트 후 결과 조회
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferredCategories: { include: { category: { select: { id: true, name: true } } } },
        excludedCategories: { include: { category: { select: { id: true, name: true } } } },
        allergies: { include: { allergyType: { select: { id: true, name: true } } } },
      },
    });

    return {
      preferredCategories: user!.preferredCategories.map((pc) => pc.category),
      excludedCategories: user!.excludedCategories.map((ec) => ec.category),
      allergies: user!.allergies.map((a) => a.allergyType),
      preferredPriceRange: user!.preferredPriceRange,
    };
  }

  /** POST /users/me/onboarding/complete — 온보딩 완료 */
  async completeOnboarding(userId: string) {
    // 위치 + 취향 설정 여부 검증
    const location = await this.prisma.userLocation.findUnique({ where: { userId } });
    if (!location) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '회사 위치를 먼저 설정해주세요.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const preferredCount = await this.prisma.userPreferredCategory.count({ where: { userId } });
    if (preferredCount === 0) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '선호 카테고리를 먼저 설정해주세요.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isOnboardingCompleted: true },
    });

    return { isOnboardingCompleted: true };
  }

  /** GET /users/me — 내 정보 조회 */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        location: {
          select: { latitude: true, longitude: true, address: true, buildingName: true },
        },
        preferredCategories: { include: { category: { select: { id: true, name: true } } } },
        excludedCategories: { include: { category: { select: { id: true, name: true } } } },
        allergies: { include: { allergyType: { select: { id: true, name: true } } } },
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
      preferences: {
        preferredCategories: user.preferredCategories.map((pc) => pc.category),
        excludedCategories: user.excludedCategories.map((ec) => ec.category),
        allergies: user.allergies.map((a) => a.allergyType),
        preferredPriceRange: user.preferredPriceRange,
      },
      notification: {
        enabled: user.notificationEnabled,
        time: user.notificationTime,
      },
      marketingAgreed: user.marketingAgreed,
      isOnboardingCompleted: user.isOnboardingCompleted,
      createdAt: user.createdAt,
    };
  }

  /** PATCH /users/me/profile — 프로필 수정 */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: Record<string, any> = {};
    if (dto.nickname !== undefined) data.nickname = dto.nickname;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        nickname: true,
        profileImageUrl: true,
      },
    });

    return user;
  }

  /** PUT /users/me/notification — 알림 설정 변경 */
  async updateNotification(userId: string, dto: UpdateNotificationDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        notificationEnabled: dto.enabled,
        notificationTime: dto.time,
      },
    });

    return { enabled: dto.enabled, time: dto.time };
  }

  /** PUT /users/me/push-token — 푸시 토큰 등록 */
  async updatePushToken(userId: string, dto: UpdatePushTokenDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { expoPushToken: dto.expoPushToken },
    });

    return { expoPushToken: dto.expoPushToken };
  }

  /** DELETE /users/me — 회원 탈퇴 (소프트 삭제 + 연관 데이터 처리) */
  async deleteMe(userId: string) {
    await this.prisma.$transaction(async (tx) => {
      // 1. User 소프트 삭제
      await tx.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          refreshToken: null,
          expoPushToken: null,
        },
      });

      // 2. 연관 테이블 즉시 삭제
      await tx.userLocation.deleteMany({ where: { userId } });
      await tx.userPreferredCategory.deleteMany({ where: { userId } });
      await tx.userExcludedCategory.deleteMany({ where: { userId } });
      await tx.userAllergy.deleteMany({ where: { userId } });
      await tx.eatingHistory.deleteMany({ where: { userId } });
      await tx.favorite.deleteMany({ where: { userId } });

      // 3. 추천 로그 익명화 (분석 데이터 보존)
      await tx.recommendationLog.updateMany({
        where: { userId },
        data: { userId: null },
      });
    });

    return null;
  }
}
