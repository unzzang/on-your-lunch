import { IsOptional, IsString, IsInt, Min, Max, IsIn, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ListRestaurantDto {
  @IsOptional()
  @IsString()
  categoryIds?: string; // 쉼표 구분 UUID

  @IsOptional()
  @IsIn(['distance', 'rating'])
  sort?: string = 'distance';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  favoritesOnly?: boolean = false;
}
