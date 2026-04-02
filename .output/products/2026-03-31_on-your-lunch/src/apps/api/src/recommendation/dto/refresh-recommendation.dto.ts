import { IsOptional, IsArray, IsString, IsInt, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class RefreshRecommendationDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[]; // UUID 배열 또는 ["all"]

  @IsOptional()
  @IsString()
  priceRange?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([5, 10, 15])
  walkMinutes?: number;
}
