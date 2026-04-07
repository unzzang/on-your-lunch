import { IsString, IsInt, IsBoolean, IsOptional, IsDateString, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEatingHistoryDto {
  @ApiProperty({ description: '식당 ID', example: 'rest-1' })
  @IsString()
  restaurantId!: string;

  @ApiProperty({ description: '식사 날짜 (ISO 8601)', example: '2026-04-01' })
  @IsDateString()
  eatenDate!: string;

  @ApiProperty({ description: '평점 (1~5)', example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ description: '메모 (최대 300자)', example: '김치찌개가 맛있었다', maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  memo?: string;

  @ApiProperty({ description: '추천으로부터 생성 여부', example: true })
  @IsBoolean()
  isFromRecommendation!: boolean;
}

export class CreateCustomEatingHistoryDto {
  @ApiProperty({ description: '식당명 (직접 입력)', example: '우리동네 떡볶이' })
  @IsString()
  restaurantName!: string;

  @ApiProperty({ description: '카테고리 ID', example: 'cat-1' })
  @IsString()
  categoryId!: string;

  @ApiProperty({ description: '식사 날짜 (ISO 8601)', example: '2026-04-01' })
  @IsDateString()
  eatenDate!: string;

  @ApiProperty({ description: '평점 (1~5)', example: 3, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ description: '메모 (최대 300자)', example: '매운맛이 좋았다', maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  memo?: string;
}

export class UpdateEatingHistoryDto {
  @ApiPropertyOptional({ description: '평점 (1~5)', example: 5, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: '메모 (최대 300자)', example: '다시 가고 싶다', maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  memo?: string;
}
