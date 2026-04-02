import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

/** JWT 페이로드 구조 */
export interface JwtPayload {
  sub: string; // user.id
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-key',
    });
  }

  /**
   * JWT 검증 성공 후 호출된다.
   * 반환값이 request.user에 들어간다.
   */
  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: '인증이 필요합니다.',
      });
    }

    return { id: user.id, email: user.email };
  }
}
