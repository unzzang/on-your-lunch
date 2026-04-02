import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class MapRestaurantDto {
  @Type(() => Number)
  @IsNumber()
  swLat!: number;

  @Type(() => Number)
  @IsNumber()
  swLng!: number;

  @Type(() => Number)
  @IsNumber()
  neLat!: number;

  @Type(() => Number)
  @IsNumber()
  neLng!: number;

  @IsOptional()
  @IsString()
  categoryIds?: string;
}
