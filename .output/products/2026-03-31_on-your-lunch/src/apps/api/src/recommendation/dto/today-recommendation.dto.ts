import { IsOptional, IsString, IsInt, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class TodayRecommendationDto {
  @IsOptional()
  @IsString()
  categoryIds?: string; // 쉼표 구분 UUID 또는 "all"

  @IsOptional()
  @IsString()
  priceRange?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([5, 10, 15])
  walkMinutes?: number;
}
