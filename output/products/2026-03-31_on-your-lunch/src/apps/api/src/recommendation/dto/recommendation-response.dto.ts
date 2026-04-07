import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RestaurantListItemDto } from '../../restaurant/dto/restaurant-response.dto';

/** 추천 필터 적용 결과 DTO */
export class FilterAppliedDto {
  @ApiPropertyOptional({ description: '적용된 카테고리 ID 배열', example: null, nullable: true, type: [String] })
  categoryIds!: string[] | null;

  @ApiPropertyOptional({ description: '적용된 가격대', example: null, nullable: true, enum: ['UNDER_10K', 'BETWEEN_10K_20K', 'OVER_20K'] })
  priceRange!: string | null;

  @ApiProperty({ description: '적용된 도보 시간(분)', example: 10 })
  walkMinutes!: number;
}

/** 오늘의 추천 응답 DTO (data 필드 안에 반환) */
export class TodayRecommendationResponseDto {
  @ApiProperty({ description: '추천 식당 목록', type: [RestaurantListItemDto] })
  restaurants!: RestaurantListItemDto[];

  @ApiProperty({ description: '오늘 새로고침 횟수', example: 1 })
  refreshCount!: number;

  @ApiProperty({ description: '최대 새로고침 횟수', example: 5 })
  maxRefreshCount!: number;

  @ApiProperty({ description: '적용된 필터', type: FilterAppliedDto })
  filterApplied!: FilterAppliedDto;
}
