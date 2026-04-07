import { IsOptional, IsString, IsInt, IsBoolean, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RestaurantListDto {
  @ApiPropertyOptional({ description: '카테고리 ID 목록 (쉼표 구분)', example: 'cat-1,cat-2' })
  @IsOptional()
  @IsString()
  categoryIds?: string;

  @ApiPropertyOptional({ description: '가격대 필터', enum: ['UNDER_10K', 'BETWEEN_10K_20K', 'OVER_20K'], example: 'UNDER_10K' })
  @IsOptional()
  @IsString()
  priceRange?: string;

  @ApiPropertyOptional({ description: '최대 도보 시간 (분)', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxWalkMinutes?: number;

  @ApiPropertyOptional({ description: '정렬 기준', enum: ['distance', 'rating'], example: 'distance' })
  @IsOptional()
  @IsString()
  sort?: 'distance' | 'rating';

  @ApiPropertyOptional({ description: '페이지 번호', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '페이지당 항목 수', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ description: '즐겨찾기만 조회', example: false, default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  favoritesOnly?: boolean = false;
}

export class RestaurantSearchDto {
  @ApiProperty({ description: '검색 키워드', example: '김치' })
  @IsString()
  q!: string;

  @ApiPropertyOptional({ description: '페이지 번호', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '페이지당 항목 수', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export class RestaurantMapDto {
  @ApiProperty({ description: '남서쪽 위도', example: 37.56 })
  @IsNumber()
  @Type(() => Number)
  swLat!: number;

  @ApiProperty({ description: '남서쪽 경도', example: 126.97 })
  @IsNumber()
  @Type(() => Number)
  swLng!: number;

  @ApiProperty({ description: '북동쪽 위도', example: 37.58 })
  @IsNumber()
  @Type(() => Number)
  neLat!: number;

  @ApiProperty({ description: '북동쪽 경도', example: 126.99 })
  @IsNumber()
  @Type(() => Number)
  neLng!: number;

  @ApiPropertyOptional({ description: '카테고리 ID 목록 (쉼표 구분)', example: 'cat-1,cat-2' })
  @IsOptional()
  @IsString()
  categoryIds?: string;

  @ApiPropertyOptional({ description: '가격대 필터', enum: ['UNDER_10K', 'BETWEEN_10K_20K', 'OVER_20K'], example: 'UNDER_10K' })
  @IsOptional()
  @IsString()
  priceRange?: string;
}
