import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { PriceRange } from '@prisma/client';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredCategoryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedCategoryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergyTypeIds?: string[];

  @IsOptional()
  @IsEnum(PriceRange)
  preferredPriceRange?: PriceRange;
}
