import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExtraModels, ApiQuery } from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { RefreshRecommendationDto } from './dto/refresh-recommendation.dto';
import { TodayRecommendationResponseDto } from './dto/recommendation-response.dto';

@ApiTags('추천')
@ApiBearerAuth()
@ApiExtraModels(TodayRecommendationResponseDto)
@Controller('recommendations')
export class RecommendationController {
  constructor(private recommendationService: RecommendationService) {}

  @Get('today')
  @ApiOperation({ summary: '오늘의 추천 식당 조회' })
  @ApiQuery({ name: 'categoryIds', required: false, description: '카테고리 ID (쉼표 구분)', example: 'cat-1,cat-2' })
  @ApiQuery({ name: 'priceRange', required: false, description: '가격대 필터', enum: ['UNDER_10K', 'BETWEEN_10K_20K', 'OVER_20K'] })
  @ApiQuery({ name: 'walkMinutes', required: false, description: '도보 시간(분)', example: '10' })
  @ApiResponse({ status: 200, description: '추천 식당 배열. data 필드 안에 반환.', type: TodayRecommendationResponseDto })
  getToday(
    @CurrentUser() user: JwtPayload,
    @Query('categoryIds') categoryIds?: string,
    @Query('priceRange') priceRange?: string,
    @Query('walkMinutes') walkMinutes?: string,
  ) {
    return this.recommendationService.getToday(user.id, {
      categoryIds,
      priceRange,
      walkMinutes: walkMinutes ? parseInt(walkMinutes, 10) : undefined,
    });
  }

  @Post('today/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '추천 새로고침 (하루 최대 5회)' })
  @ApiResponse({ status: 200, description: '새 추천 식당 배열. data 필드 안에 반환.', type: TodayRecommendationResponseDto })
  @ApiResponse({ status: 429, description: '새로고침 횟수 초과' })
  refresh(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RefreshRecommendationDto,
  ) {
    return this.recommendationService.refresh(user.id, {
      categoryIds: dto.categoryIds,
      priceRange: dto.priceRange,
      walkMinutes: dto.walkMinutes,
    });
  }
}
