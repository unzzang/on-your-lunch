import { IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({ description: 'Google OAuth ID 토큰', example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6...' })
  @IsString()
  idToken!: string;

  @ApiProperty({ description: '서비스 이용약관 동의 여부', example: true })
  @IsBoolean()
  termsAgreed!: boolean;

  @ApiProperty({ description: '마케팅 수신 동의 여부', example: false })
  @IsBoolean()
  marketingAgreed!: boolean;
}

/** 로그인 응답 내 사용자 정보 */
export class LoginUserDto {
  @ApiProperty({ description: '사용자 ID', example: 'clxyz123' })
  id!: string;

  @ApiProperty({ description: '이메일', example: 'user@example.com' })
  email!: string;

  @ApiProperty({ description: '닉네임', example: '점심러버' })
  nickname!: string;

  @ApiProperty({ description: '프로필 이미지 URL', example: null, nullable: true })
  profileImageUrl!: string | null;

  @ApiProperty({ description: '온보딩 완료 여부', example: false })
  isOnboardingCompleted!: boolean;
}

/** Google 로그인 / 개발 로그인 응답 DTO (data 필드 안에 반환) */
export class GoogleLoginResponseDto {
  @ApiProperty({ description: 'JWT 액세스 토큰', example: 'eyJhbGciOiJIUzI1NiIs...' })
  accessToken!: string;

  @ApiProperty({ description: 'JWT 리프레시 토큰', example: 'eyJhbGciOiJIUzI1NiIs...' })
  refreshToken!: string;

  @ApiProperty({ description: '사용자 정보', type: LoginUserDto })
  user!: LoginUserDto;
}

/** 토큰 갱신 응답 DTO (data 필드 안에 반환) */
export class TokenResponseDto {
  @ApiProperty({ description: '새 JWT 액세스 토큰', example: 'eyJhbGciOiJIUzI1NiIs...' })
  accessToken!: string;

  @ApiProperty({ description: '새 JWT 리프레시 토큰', example: 'eyJhbGciOiJIUzI1NiIs...' })
  refreshToken!: string;
}
