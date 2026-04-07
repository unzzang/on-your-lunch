import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FavoriteToggleDto {
  @ApiProperty({ description: '식당 ID', example: 'rest-1' })
  @IsString()
  restaurantId!: string;
}

/** 즐겨찾기 토글 응답 DTO (data 필드 안에 반환) */
export class FavoriteToggleResponseDto {
  @ApiProperty({ description: '식당 ID', example: 'rest-1' })
  restaurantId!: string;

  @ApiProperty({ description: '즐겨찾기 상태', example: true })
  isFavorite!: boolean;
}
