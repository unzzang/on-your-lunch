import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ description: '이벤트명', example: 'restaurant_view' })
  @IsString()
  eventName!: string;

  @ApiPropertyOptional({ description: '이벤트 데이터 (JSON 객체)', example: { restaurantId: 'rest-1' } })
  @IsOptional()
  @IsObject()
  eventData?: Record<string, any>;
}
