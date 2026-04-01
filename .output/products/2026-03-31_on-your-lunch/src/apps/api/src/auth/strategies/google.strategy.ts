import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

/**
 * Google OAuth 전략.
 * 모바일 앱에서 Google Sign-In SDK로 받은 idToken을 서버에서 검증한다.
 */
@Injectable()
export class GoogleStrategy {
  private readonly client: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  /**
   * Google ID Token을 검증하여 사용자 정보를 반환한다.
   */
  async verifyIdToken(idToken: string): Promise<{
    googleId: string;
    email: string;
    name: string;
    picture: string | null;
  }> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Google ID Token 검증에 실패했습니다.');
      }

      return {
        googleId: payload.sub,
        email: payload.email!,
        name: payload.name || payload.email!.split('@')[0],
        picture: payload.picture || null,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Google ID Token 검증에 실패했습니다.');
    }
  }
}
