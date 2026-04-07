import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { PriceRange } from '@prisma/client';

interface GoogleUserInfo {
  googleId: string;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async googleLogin(idToken: string, termsAgreed: boolean, marketingAgreed: boolean) {
    const googleUser = await this.verifyGoogleIdToken(idToken);

    let user = await this.prisma.user.findUnique({
      where: { googleId: googleUser.googleId },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          nickname: googleUser.nickname,
          profileImageUrl: googleUser.profileImageUrl,
          googleId: googleUser.googleId,
          marketingAgreed,
          termsAgreedAt: new Date(),
          preferredPriceRange: PriceRange.BETWEEN_10K_20K,
        },
      });
    } else {
      // 소프트 삭제된 사용자 차단
      if (user.deletedAt) {
        throw new HttpException(
          { code: 'ACCOUNT_DELETED', message: '탈퇴한 계정입니다.' },
          HttpStatus.FORBIDDEN,
        );
      }

      // 재로그인 시 Google 프로필 동기화
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          email: googleUser.email,
          nickname: googleUser.nickname,
          profileImageUrl: googleUser.profileImageUrl,
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl,
        isOnboardingCompleted: user.isOnboardingCompleted,
      },
      isNewUser,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.deletedAt || user.refreshToken !== refreshToken) {
        throw new HttpException(
          { code: 'TOKEN_EXPIRED', message: '토큰이 만료되었습니다.' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const tokens = await this.generateTokens(user.id, user.email);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return tokens;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { code: 'TOKEN_EXPIRED', message: '토큰이 만료되었습니다.' },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return null;
  }

  async devLogin(email?: string) {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_LOGIN !== 'true') {
      throw new HttpException(
        { code: 'NOT_FOUND', message: 'Not Found' },
        HttpStatus.NOT_FOUND,
      );
    }

    const testEmail = email || 'test@example.com';
    const testGoogleId = 'dev-test-user';

    let user = await this.prisma.user.findUnique({
      where: { googleId: testGoogleId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: testEmail,
          nickname: '사용자',
          googleId: testGoogleId,
          profileImageUrl: null,
          marketingAgreed: true,
          termsAgreedAt: new Date(),
          preferredPriceRange: PriceRange.BETWEEN_10K_20K,
          isOnboardingCompleted: true,
        },
      });
    }

    if (!user.isOnboardingCompleted) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isOnboardingCompleted: true,
          preferredPriceRange: PriceRange.BETWEEN_10K_20K,
        },
      });
    }

    // 회사 위치 (강남역)
    await this.prisma.userLocation.upsert({
      where: { userId: user.id },
      update: {
        latitude: 37.4979,
        longitude: 127.0276,
        address: '서울특별시 강남구 강남대로 396',
        buildingName: '강남역',
      },
      create: {
        userId: user.id,
        latitude: 37.4979,
        longitude: 127.0276,
        address: '서울특별시 강남구 강남대로 396',
        buildingName: '강남역',
      },
    });

    // 선호 카테고리 전체 설정
    const allCategories = await this.prisma.category.findMany();
    if (allCategories.length > 0) {
      await this.prisma.userPreferredCategory.deleteMany({
        where: { userId: user.id },
      });
      await this.prisma.userPreferredCategory.createMany({
        data: allCategories.map((cat) => ({
          userId: user.id,
          categoryId: cat.id,
        })),
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl,
        isOnboardingCompleted: user.isOnboardingCompleted,
      },
    };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'dev-secret-key',
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key',
        expiresIn: '30d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async verifyGoogleIdToken(idToken: string): Promise<GoogleUserInfo> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.sub || !payload.email) {
        throw new Error('Invalid token payload');
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        nickname: payload.name || payload.email.split('@')[0],
        profileImageUrl: payload.picture || null,
      };
    } catch (error) {
      this.logger.error(`Google ID Token 검증 실패: ${error}`);
      throw new HttpException(
        { code: 'UNAUTHORIZED', message: 'Google 인증에 실패했습니다.' },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
