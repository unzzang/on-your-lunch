import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { GoogleStrategy } from './strategies/google.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly googleStrategy: GoogleStrategy,
  ) {}

  /**
   * Google ID Token 검증 후 로그인/회원가입 처리.
   */
  async googleLogin(body: {
    idToken: string;
    termsAgreed: boolean;
    marketingAgreed: boolean;
  }) {
    // Google ID Token 검증
    const googleUser = await this.googleStrategy.verifyIdToken(body.idToken);

    // 기존 사용자 조회 (소프트 삭제된 계정 제외)
    let user = await this.prisma.user.findFirst({
      where: { googleId: googleUser.googleId, deletedAt: null },
    });

    let isNewUser = false;

    if (user) {
      // 기존 사용자 — 토큰 발급만
      const tokens = await this.generateTokenPair(user.id);
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          profileImageUrl: user.profileImageUrl,
          isOnboardingCompleted: user.isOnboardingCompleted,
        },
      };
    }

    // 신규 가입
    if (!body.termsAgreed) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: '필수 약관에 동의해야 합니다.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    user = await this.prisma.user.create({
      data: {
        email: googleUser.email,
        nickname: googleUser.name.substring(0, 10), // 최대 10자
        profileImageUrl: googleUser.picture,
        googleId: googleUser.googleId,
        marketingAgreed: body.marketingAgreed || false,
        termsAgreedAt: new Date(),
        preferredPriceRange: 'BETWEEN_10K_20K',
      },
    });

    isNewUser = true;

    const tokens = await this.generateTokenPair(user.id);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
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
   * Refresh Token 검증 후 새 토큰 쌍을 발급한다.
   */
  async refreshToken(refreshToken: string) {
    try {
      // Refresh Token 검증
      const payload = this.jwtService.verify<{ sub: string }>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      // DB에 저장된 Refresh Token과 비교
      const user = await this.prisma.user.findFirst({
        where: { id: payload.sub, deletedAt: null },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException();
      }

      // 새 토큰 쌍 발급
      return this.generateTokenPair(user.id);
    } catch {
      throw new HttpException(
        { code: 'TOKEN_EXPIRED', message: '토큰이 만료되었습니다.' },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * 로그아웃 — Refresh Token과 푸시 토큰을 삭제한다.
   */
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null, expoPushToken: null },
    });
    return null;
  }

  /**
   * Access Token + Refresh Token 쌍을 생성한다.
   */
  async generateTokenPair(userId: string) {
    const payload = { sub: userId };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d',
    });

    // DB에 Refresh Token 저장
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }
}
