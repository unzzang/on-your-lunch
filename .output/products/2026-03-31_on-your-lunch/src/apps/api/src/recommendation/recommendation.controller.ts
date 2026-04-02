import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TodayRecommendationDto } from './dto/today-recommendation.dto';
import { RefreshRecommendationDto } from './dto/refresh-recommendation.dto';

@Controller('recommendations')
export class RecommendationController {
  constructor(private recommendationService: RecommendationService) {}

  /** GET /recommendations/today — 오늘의 추천 조회 */
  @Get('today')
  getToday(
    @Query() dto: TodayRecommendationDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.recommendationService.getToday(
      user.id,
      dto.categoryIds,
      dto.priceRange,
      dto.walkMinutes,
    );
  }

  /** POST /recommendations/today/refresh — 추천 새로고침 */
  @Post('today/refresh')
  @HttpCode(HttpStatus.OK)
  refresh(
    @Body() dto: RefreshRecommendationDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.recommendationService.refresh(
      user.id,
      dto.categoryIds,
      dto.priceRange,
      dto.walkMinutes,
    );
  }
}
