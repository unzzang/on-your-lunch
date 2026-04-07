import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategorySummaryDto } from '../../user/dto/user-response.dto';
import { PaginationMetaDto } from '../../common/dto/api-response.dto';

/** 내 방문 요약 DTO */
export class MyVisitSummaryDto {
  @ApiProperty({ description: '평점 (1~5)', example: 4 })
  rating!: number;

  @ApiProperty({ description: '방문 횟수', example: 3 })
  visitCount!: number;

  @ApiPropertyOptional({ description: '마지막 방문일', example: '2026-04-01', nullable: true })
  lastDate?: string;
}

/** 식당 목록 항목 DTO (data 필드 안에 반환) */
export class RestaurantListItemDto {
  @ApiProperty({ description: '식당 ID', example: 'rest-1' })
  id!: string;

  @ApiProperty({ description: '식당명', example: '맛있는 김치찌개' })
  name!: string;

  @ApiProperty({ description: '카테고리', type: CategorySummaryDto })
  category!: CategorySummaryDto;

  @ApiProperty({ description: '위도', example: 37.5665 })
  latitude!: number;

  @ApiProperty({ description: '경도', example: 126.978 })
  longitude!: number;

  @ApiProperty({ description: '도보 소요 시간(분)', example: 5 })
  walkMinutes!: number;

  @ApiPropertyOptional({ description: '가격대', enum: ['UNDER_10K', 'BETWEEN_10K_20K', 'OVER_20K'], nullable: true, example: 'UNDER_10K' })
  priceRange!: string | null;

  @ApiPropertyOptional({ description: '썸네일 URL', example: null, nullable: true })
  thumbnailUrl!: string | null;

  @ApiPropertyOptional({ description: '설명', example: '직장인에게 인기 많은 한식당', nullable: true })
  description!: string | null;

  @ApiProperty({ description: '즐겨찾기 여부', example: false })
  isFavorite!: boolean;

  @ApiPropertyOptional({ description: '내 방문 요약', type: MyVisitSummaryDto, nullable: true })
  myVisit!: MyVisitSummaryDto | null;

  @ApiProperty({ description: '영업 종료 여부', example: false })
  isClosed!: boolean;
}

/** 식당 사진 DTO */
export class RestaurantPhotoDto {
  @ApiProperty({ description: '사진 ID', example: 'photo-1' })
  id!: string;

  @ApiProperty({ description: '이미지 URL', example: 'https://example.com/photo.jpg' })
  imageUrl!: string;

  @ApiProperty({ description: '대표 이미지 여부', example: true })
  isThumbnail!: boolean;
}

/** 식당 메뉴 항목 DTO */
export class RestaurantMenuItemDto {
  @ApiProperty({ description: '메뉴 ID', example: 'menu-1' })
  id!: string;

  @ApiProperty({ description: '메뉴명', example: '김치찌개' })
  name!: string;

  @ApiPropertyOptional({ description: '가격 (원)', example: 9000, nullable: true })
  price!: number | null;
}

/** 식당 상세 응답 DTO (data 필드 안에 반환) */
export class RestaurantDetailResponseDto {
  @ApiProperty({ description: '식당 ID', example: 'rest-1' })
  id!: string;

  @ApiProperty({ description: '식당명', example: '맛있는 김치찌개' })
  name!: string;

  @ApiProperty({ description: '카테고리', type: CategorySummaryDto })
  category!: CategorySummaryDto;

  @ApiProperty({ description: '주소', example: '서울특별시 중구 명동길 14' })
  address!: string;

  @ApiProperty({ description: '위도', example: 37.5665 })
  latitude!: number;

  @ApiProperty({ description: '경도', example: 126.978 })
  longitude!: number;

  @ApiProperty({ description: '도보 소요 시간(분)', example: 5 })
  walkMinutes!: number;

  @ApiPropertyOptional({ description: '전화번호', example: '02-1234-5678', nullable: true })
  phone!: string | null;

  @ApiPropertyOptional({ description: '설명', example: '직장인에게 인기 많은 한식당', nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ description: '가격대', enum: ['UNDER_10K', 'BETWEEN_10K_20K', 'OVER_20K'], nullable: true, example: 'UNDER_10K' })
  priceRange!: string | null;

  @ApiPropertyOptional({ description: '영업시간', example: '11:00 - 21:00', nullable: true })
  businessHours!: string | null;

  @ApiPropertyOptional({ description: '썸네일 URL', example: null, nullable: true })
  thumbnailUrl!: string | null;

  @ApiProperty({ description: '사진 목록', type: [RestaurantPhotoDto] })
  photos!: RestaurantPhotoDto[];

  @ApiProperty({ description: '메뉴 목록', type: [RestaurantMenuItemDto] })
  menus!: RestaurantMenuItemDto[];

  @ApiProperty({ description: '즐겨찾기 여부', example: false })
  isFavorite!: boolean;

  @ApiProperty({ description: '영업 종료 여부', example: false })
  isClosed!: boolean;

  @ApiPropertyOptional({ description: '내 방문 요약', type: MyVisitSummaryDto, nullable: true })
  myVisit!: MyVisitSummaryDto | null;
}

/** 식당 목록 페이지네이션 응답 DTO (data 필드 안에 반환) */
export class RestaurantPaginatedResponseDto {
  @ApiProperty({ description: '식당 목록', type: [RestaurantListItemDto] })
  items!: RestaurantListItemDto[];

  @ApiProperty({ description: '페이지네이션 메타', type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

/** 지도 핀 DTO */
export class RestaurantMapPinDto {
  @ApiProperty({ description: '식당 ID', example: 'rest-1' })
  id!: string;

  @ApiProperty({ description: '식당명', example: '맛있는 김치찌개' })
  name!: string;

  @ApiProperty({ description: '카테고리 색상 코드', example: '#FF6B35' })
  categoryColorCode!: string;

  @ApiProperty({ description: '위도', example: 37.5665 })
  latitude!: number;

  @ApiProperty({ description: '경도', example: 126.978 })
  longitude!: number;

  @ApiProperty({ description: '도보 소요 시간(분)', example: 5 })
  walkMinutes!: number;

  @ApiPropertyOptional({ description: '가격대', enum: ['UNDER_10K', 'BETWEEN_10K_20K', 'OVER_20K'], nullable: true, example: 'UNDER_10K' })
  priceRange!: string | null;

  @ApiProperty({ description: '즐겨찾기 여부', example: false })
  isFavorite!: boolean;
}

/** 지도 핀 응답 DTO (data 필드 안에 반환) */
export class RestaurantMapResponseDto {
  @ApiProperty({ description: '식당 핀 배열', type: [RestaurantMapPinDto] })
  pins!: RestaurantMapPinDto[];

  @ApiProperty({ description: '전체 핀 수', example: 15 })
  totalCount!: number;
}
