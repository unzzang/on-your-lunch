import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLocationDto {
  @ApiProperty({ description: '위도', example: 37.5665 })
  @IsNumber()
  latitude!: number;

  @ApiProperty({ description: '경도', example: 126.978 })
  @IsNumber()
  longitude!: number;

  @ApiProperty({ description: '주소', example: '서울특별시 중구 세종대로 110' })
  @IsString()
  address!: string;

  @ApiPropertyOptional({ description: '건물명', example: '서울시청' })
  @IsOptional()
  @IsString()
  buildingName?: string;
}
