import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { PriceRange } from '@prisma/client';

/** Google ID Token에서 추출한 사용자 정보 (개발용 모의 처리) */
interface GoogleUserInfo {
  googleId: string;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Google ID Token을 검증하고 JWT를 발급한다.
   * 로컬 개발에서는 실제 Google API 대신 모의 처리한다.
   */
  async googleLogin(idToken: string, termsAgreed: boolean, marketingAgreed: boolean) {
    // 개발용: ID Token에서 사용자 정보 모의 추출
    const googleUser = this.verifyGoogleIdToken(idToken);

    // 기존 사용자 조회
    let user = await this.prisma.user.findUnique({
      where: { googleId: googleUser.googleId },
    });

    let isNewUser = false;

    if (!user) {
      // 신규 가입
      isNewUser = true;
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          nickname: googleUser.nickname,
          profileImageUrl: googleUser.profileImageUrl,
          googleId: googleUser.googleId,
          marketingAgreed,
          termsAgreedAt: new Date(),
          preferredPriceRange: PriceRange.BETWEEN_10K_20K, // 기본값
        },
      });
    }

    // JWT 발급
    const tokens = await this.generateTokens(user.id, user.email);

    // Refresh Token 저장
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

  /** Refresh Token으로 새 토큰 발급 */
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

  /** 로그아웃: Refresh Token 무효화 */
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return null;
  }

  /** Access Token + Refresh Token 생성 */
  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'dev-secret-key',
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key',
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * 개발용 임시 로그인.
   * NODE_ENV=development에서만 동작한다. 프로덕션에서는 404를 반환한다.
   * 테스트 사용자를 자동 생성하고, 온보딩 완료 상태 + JWT를 발급한다.
   */
  async devLogin(email?: string) {
    if (process.env.NODE_ENV !== 'development') {
      throw new HttpException(
        { code: 'NOT_FOUND', message: 'Not Found' },
        HttpStatus.NOT_FOUND,
      );
    }

    const testEmail = email || 'test@example.com';
    const testGoogleId = 'dev-test-user';

    // 1. 테스트 사용자 조회 또는 생성
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

    // 2. 온보딩 미완료 상태이면 완료로 업데이트
    if (!user.isOnboardingCompleted) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isOnboardingCompleted: true,
          preferredPriceRange: PriceRange.BETWEEN_10K_20K,
        },
      });
    }

    // 3. 회사 위치 설정 (강남역 근처)
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

    // 4. 선호 카테고리를 전체(7개)로 설정
    const allCategories = await this.prisma.category.findMany();
    if (allCategories.length > 0) {
      // 기존 선호 카테고리 삭제 후 전체 재등록
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

    // 5. JWT 토큰 발급
    const tokens = await this.generateTokens(user.id, user.email);

    // Refresh Token 저장
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

  /**
   * Google ID Token 모의 검증 (로컬 개발용).
   * 프로덕션에서는 Google OAuth2Client.verifyIdToken()으로 교체해야 한다.
   */
  private verifyGoogleIdToken(idToken: string): GoogleUserInfo {
    // 개발용: idToken 문자열을 그대로 googleId로 사용
    // 실제 구현 시 google-auth-library의 OAuth2Client 사용
    return {
      googleId: `google_${idToken.slice(0, 20)}`,
      email: `user_${idToken.slice(0, 8)}@gmail.com`,
      nickname: '점심러',
      profileImageUrl: null,
    };
  }
}
