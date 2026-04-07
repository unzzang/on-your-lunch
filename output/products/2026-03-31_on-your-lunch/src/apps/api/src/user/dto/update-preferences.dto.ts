import { IsArray, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PriceRange } from '@prisma/client';

export class UpdatePreferencesDto {
  @ApiProperty({ description: '선호 카테고리 ID 배열', example: ['cat-1', 'cat-2'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  preferredCategoryIds!: string[];

  @ApiProperty({ description: '제외 카테고리 ID 배열', example: [], type: [String] })
  @IsArray()
  @IsString({ each: true })
  excludedCategoryIds!: string[];

  @ApiProperty({ description: '알레르기 유형 ID 배열', example: ['allergy-1'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  allergyTypeIds!: string[];

  @ApiProperty({ description: '선호 가격대', enum: PriceRange, example: 'UNDER_10K' })
  @IsEnum(PriceRange)
  preferredPriceRange!: PriceRange;
}
