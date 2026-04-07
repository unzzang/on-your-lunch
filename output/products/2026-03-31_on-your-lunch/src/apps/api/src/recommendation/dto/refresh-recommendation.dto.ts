import { IsOptional, IsArray, IsString, IsInt, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PriceRange } from '@prisma/client';

export class RefreshRecommendationDto {
  @ApiPropertyOptional({ description: '필터할 카테고리 ID 배열', example: ['cat-1'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({ description: '가격대 필터', enum: PriceRange, example: 'UNDER_10K' })
  @IsOptional()
  @IsEnum(PriceRange)
  priceRange?: PriceRange;

  @ApiPropertyOptional({ description: '도보 시간 필터(분)', example: 10 })
  @IsOptional()
  @IsInt()
  walkMinutes?: number;
}
