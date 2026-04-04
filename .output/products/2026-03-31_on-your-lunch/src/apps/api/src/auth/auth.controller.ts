import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /** POST /auth/google — Google 로그인 [Public] */
  @Public()
  @Post('google')
  async googleLogin(@Body() dto: GoogleLoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.googleLogin(
      dto.idToken,
      dto.termsAgreed,
      dto.marketingAgreed,
    );

    // 신규 가입이면 201, 기존 사용자면 200
    res.status(result.isNewUser ? HttpStatus.CREATED : HttpStatus.OK);

    const { isNewUser, ...data } = result;
    return data;
  }

  /** POST /auth/dev-login — 개발용 임시 로그인 [Public, development only] */
  @Public()
  @Post('dev-login')
  @HttpCode(HttpStatus.OK)
  devLogin(@Body() body: { email?: string }) {
    return this.authService.devLogin(body?.email);
  }

  /** POST /auth/refresh — 토큰 갱신 [Public] */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  /** POST /auth/logout — 로그아웃 */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@CurrentUser() user: { id: string }) {
    return this.authService.logout(user.id);
  }
}
