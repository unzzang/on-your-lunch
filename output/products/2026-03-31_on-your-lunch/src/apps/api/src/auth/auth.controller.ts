import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleLoginDto, GoogleLoginResponseDto, TokenResponseDto } from './dto/google-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('인증')
@ApiExtraModels(GoogleLoginResponseDto, TokenResponseDto)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('google')
  @ApiOperation({ summary: 'Google OAuth 로그인' })
  @ApiResponse({ status: 200, description: '기존 사용자 로그인 성공. data 필드 안에 반환.', type: GoogleLoginResponseDto })
  @ApiResponse({ status: 201, description: '신규 사용자 회원가입 + 로그인 성공. data 필드 안에 반환.', type: GoogleLoginResponseDto })
  async googleLogin(@Body() dto: GoogleLoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.googleLogin(
      dto.idToken,
      dto.termsAgreed,
      dto.marketingAgreed,
    );
    res.status(result.isNewUser ? HttpStatus.CREATED : HttpStatus.OK);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isNewUser, ...data } = result;
    return data;
  }

  @Public()
  @Post('dev-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '개발용 로그인 (NODE_ENV=development 전용)' })
  @ApiResponse({ status: 200, description: '개발용 토큰 발급 성공. data 필드 안에 반환.', type: GoogleLoginResponseDto })
  devLogin(@Body() body: { email?: string }) {
    return this.authService.devLogin(body?.email);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiResponse({ status: 200, description: '새 accessToken/refreshToken 발급. data 필드 안에 반환.', type: TokenResponseDto })
  @ApiResponse({ status: 401, description: '만료되거나 유효하지 않은 refreshToken' })
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공 (refreshToken 무효화). data 필드 안에 { message: "로그아웃 성공" } 반환.' })
  logout(@CurrentUser() user: JwtPayload) {
    return this.authService.logout(user.id);
  }
}
