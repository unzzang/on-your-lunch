import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/** 카테고리 요약 DTO */
export class CategorySummaryDto {
  @ApiProperty({ description: '카테고리 ID', example: 'cat-1' })
  id!: string;

  @ApiProperty({ description: '카테고리명', example: '한식' })
  name!: string;

  @ApiProperty({ description: '카테고리 색상 코드', example: '#FF6B35' })
  colorCode!: string;
}

/** 알레르기 정보 DTO */
export class AllergyDto {
  @ApiProperty({ description: '알레르기 ID', example: 'allergy-1' })
  id!: string;

  @ApiProperty({ description: '알레르기명', example: '갑각류' })
  name!: string;
}

/** 사용자 위치 DTO */
export class UserLocationDto {
  @ApiProperty({ description: '위도', example: 37.5665 })
  latitude!: number;

  @ApiProperty({ description: '경도', example: 126.978 })
  longitude!: number;

  @ApiProperty({ description: '주소', example: '서울특별시 중구 세종대로 110' })
  address!: string;

  @ApiPropertyOptional({ description: '건물명', example: '서울시청', nullable: true })
  buildingName!: string | null;
}

/** 사용자 선호 설정 DTO */
export class UserPreferencesDto {
  @ApiProperty({ description: '선호 카테고리', type: [CategorySummaryDto] })
  preferredCategories!: CategorySummaryDto[];

  @ApiProperty({ description: '제외 카테고리', type: [CategorySummaryDto] })
  excludedCategories!: CategorySummaryDto[];

  @ApiProperty({ description: '알레르기 목록', type: [AllergyDto] })
  allergies!: AllergyDto[];

  @ApiProperty({ description: '선호 가격대', enum: ['UNDER_10K', 'BETWEEN_10K_20K', 'OVER_20K'], example: 'UNDER_10K' })
  preferredPriceRange!: string;
}

/** 알림 설정 DTO */
export class NotificationSettingsDto {
  @ApiProperty({ description: '알림 활성화 여부', example: true })
  enabled!: boolean;

  @ApiProperty({ description: '알림 시간 (HH:mm)', example: '11:30' })
  time!: string;
}

/** 사용자 프로필 응답 DTO (data 필드 안에 반환) */
export class UserProfileResponseDto {
  @ApiProperty({ description: '사용자 ID', example: 'clxyz123' })
  id!: string;

  @ApiProperty({ description: '이메일', example: 'user@example.com' })
  email!: string;

  @ApiProperty({ description: '닉네임', example: '점심러버' })
  nickname!: string;

  @ApiPropertyOptional({ description: '프로필 이미지 URL', example: null, nullable: true })
  profileImageUrl!: string | null;

  @ApiPropertyOptional({ description: '회사 위치 정보', type: UserLocationDto, nullable: true })
  location!: UserLocationDto | null;

  @ApiProperty({ description: '음식 선호 설정', type: UserPreferencesDto })
  preferences!: UserPreferencesDto;

  @ApiProperty({ description: '알림 설정', type: NotificationSettingsDto })
  notification!: NotificationSettingsDto;

  @ApiProperty({ description: '마케팅 수신 동의 여부', example: false })
  marketingAgreed!: boolean;

  @ApiProperty({ description: '온보딩 완료 여부', example: false })
  isOnboardingCompleted!: boolean;

  @ApiProperty({ description: '가입일', example: '2026-04-01T09:00:00.000Z' })
  createdAt!: string;
}

/** 푸시 토큰 요청 DTO */
export class UpdatePushTokenDto {
  @ApiProperty({ description: 'Expo 푸시 토큰', example: 'ExponentPushToken[xxx]' })
  @IsString()
  expoPushToken!: string;
}
