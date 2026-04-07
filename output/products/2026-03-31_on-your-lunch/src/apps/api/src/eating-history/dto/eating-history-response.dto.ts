import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 식사 기록 내 식당 요약 카테고리 DTO */
export class HistoryCategoryDto {
  @ApiProperty({ description: '카테고리명', example: '한식' })
  name!: string;

  @ApiProperty({ description: '카테고리 색상 코드', example: '#FF6B35' })
  colorCode!: string;
}

/** 식사 기록 내 식당 요약 DTO */
export class HistoryRestaurantDto {
  @ApiProperty({ description: '식당 ID', example: 'rest-1' })
  id!: string;

  @ApiProperty({ description: '식당명', example: '맛있는 김치찌개' })
  name!: string;

  @ApiProperty({ description: '카테고리', type: HistoryCategoryDto })
  category!: HistoryCategoryDto;
}

/** 식사 기록 항목 DTO (data 필드 안에 반환) */
export class EatingHistoryItemDto {
  @ApiProperty({ description: '기록 ID', example: 'hist-1' })
  id!: string;

  @ApiProperty({ description: '식당 정보', type: HistoryRestaurantDto })
  restaurant!: HistoryRestaurantDto;

  @ApiProperty({ description: '식사 날짜', example: '2026-04-01' })
  eatenDate!: string;

  @ApiProperty({ description: '평점 (1~5)', example: 4 })
  rating!: number;

  @ApiPropertyOptional({ description: '메모', example: '김치찌개가 맛있었다', nullable: true })
  memo!: string | null;

  @ApiProperty({ description: '추천으로부터 생성 여부', example: true })
  isFromRecommendation!: boolean;

  @ApiProperty({ description: '생성일시', example: '2026-04-01T12:30:00.000Z' })
  createdAt!: string;
}

/** 캘린더 내 식당 요약 DTO */
export class CalendarRestaurantDto {
  @ApiProperty({ description: '식당 ID', example: 'rest-1' })
  id!: string;

  @ApiProperty({ description: '식당명', example: '맛있는 김치찌개' })
  name!: string;
}

/** 캘린더 기록 DTO */
export class CalendarRecordDto {
  @ApiProperty({ description: '기록 ID', example: 'hist-1' })
  id!: string;

  @ApiProperty({ description: '식당 정보', type: CalendarRestaurantDto })
  restaurant!: CalendarRestaurantDto;

  @ApiProperty({ description: '카테고리', type: HistoryCategoryDto })
  category!: HistoryCategoryDto;

  @ApiProperty({ description: '평점 (1~5)', example: 4 })
  rating!: number;

  @ApiPropertyOptional({ description: '메모', example: null, nullable: true })
  memo!: string | null;
}

/** 캘린더 일별 DTO */
export class CalendarDayDto {
  @ApiProperty({ description: '날짜 (YYYY-MM-DD)', example: '2026-04-01' })
  date!: string;

  @ApiProperty({ description: '해당 날짜 기록 목록', type: [CalendarRecordDto] })
  records!: CalendarRecordDto[];
}

/** 월별 캘린더 응답 DTO (data 필드 안에 반환) */
export class CalendarResponseDto {
  @ApiProperty({ description: '연도', example: 2026 })
  year!: number;

  @ApiProperty({ description: '월', example: 4 })
  month!: number;

  @ApiProperty({ description: '일별 기록 배열', type: [CalendarDayDto] })
  days!: CalendarDayDto[];
}
