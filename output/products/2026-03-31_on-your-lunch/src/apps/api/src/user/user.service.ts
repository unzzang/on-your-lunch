import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        location: true,
        preferredCategories: { include: { category: true } },
        excludedCategories: { include: { category: true } },
        allergies: { include: { allergyType: true } },
      },
    });

    if (!user || user.deletedAt) {
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
        preferredCategories: user.preferredCategories.map((pc) => ({
          id: pc.category.id,
          name: pc.category.name,
          colorCode: pc.category.colorCode,
        })),
        excludedCategories: user.excludedCategories.map((ec) => ({
          id: ec.category.id,
          name: ec.category.name,
          colorCode: ec.category.colorCode,
        })),
        allergies: user.allergies.map((a) => ({
          id: a.allergyType.id,
          name: a.allergyType.name,
        })),
        preferredPriceRange: user.preferredPriceRange,
      },
      notification: {
        enabled: user.notificationEnabled,
        time: user.notificationTime,
      },
      marketingAgreed: user.marketingAgreed,
      isOnboardingCompleted: user.isOnboardingCompleted,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateLocation(userId: string, dto: UpdateLocationDto) {
    const location = await this.prisma.userLocation.upsert({
      where: { userId },
      update: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        buildingName: dto.buildingName ?? null,
      },
      create: {
        userId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        buildingName: dto.buildingName ?? null,
      },
    });

    return {
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      address: location.address,
      buildingName: location.buildingName,
    };
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    // 트랜잭션으로 한번에 처리
    await this.prisma.$transaction(async (tx) => {
      // 선호 카테고리
      await tx.userPreferredCategory.deleteMany({ where: { userId } });
      if (dto.preferredCategoryIds.length > 0) {
        await tx.userPreferredCategory.createMany({
          data: dto.preferredCategoryIds.map((categoryId) => ({
            userId,
            categoryId,
          })),
        });
      }

      // 제외 카테고리
      await tx.userExcludedCategory.deleteMany({ where: { userId } });
      if (dto.excludedCategoryIds.length > 0) {
        await tx.userExcludedCategory.createMany({
          data: dto.excludedCategoryIds.map((categoryId) => ({
            userId,
            categoryId,
          })),
        });
      }

      // 알레르기
      await tx.userAllergy.deleteMany({ where: { userId } });
      if (dto.allergyTypeIds.length > 0) {
        await tx.userAllergy.createMany({
          data: dto.allergyTypeIds.map((allergyTypeId) => ({
            userId,
            allergyTypeId,
          })),
        });
      }

      // 가격대
      await tx.user.update({
        where: { id: userId },
        data: { preferredPriceRange: dto.preferredPriceRange },
      });
    });

    // 결과 조회
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
        colorCode: pc.category.colorCode,
      })),
      excludedCategories: user!.excludedCategories.map((ec) => ({
        id: ec.category.id,
        name: ec.category.name,
        colorCode: ec.category.colorCode,
      })),
      allergies: user!.allergies.map((a) => ({
        id: a.allergyType.id,
        name: a.allergyType.name,
      })),
      preferredPriceRange: user!.preferredPriceRange,
    };
  }

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

    if (!user.location) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '회사 위치를 먼저 설정해주세요.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.preferredCategories.length === 0) {
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

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: Record<string, string | null> = {};
    if (dto.nickname) data.nickname = dto.nickname;
    if (dto.profileImageUrl !== undefined) data.profileImageUrl = dto.profileImageUrl;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileImageUrl: user.profileImageUrl,
    };
  }

  async getNotification(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notificationEnabled: true, notificationTime: true },
    });

    if (!user) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: '사용자를 찾을 수 없습니다.' },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      enabled: user.notificationEnabled,
      time: user.notificationTime,
    };
  }

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

  async updatePushToken(userId: string, expoPushToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { expoPushToken },
    });
    return { expoPushToken };
  }

  async deleteAccount(userId: string) {
    await this.prisma.$transaction(async (tx) => {
      // 소프트 삭제 — User와 연관 데이터 모두 유지 (30일 유예 후 배치 삭제)
      await tx.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          refreshToken: null,
          expoPushToken: null,
        },
      });

      // 추천 로그 익명화
      await tx.recommendationLog.updateMany({
        where: { userId },
        data: { userId: null },
      });

      // 이벤트 로그 익명화
      await tx.eventLog.updateMany({
        where: { userId },
        data: { userId: null },
      });
    });

    return null;
  }
}
