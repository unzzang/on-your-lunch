import { Controller, Get, Post, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common';
import { RecommendationService } from './recommendation.service';

@ApiTags('추천')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get('today')
  @ApiOperation({ summary: '오늘의 추천 조회' })
  async getToday(
    @CurrentUser() user: { userId: string },
    @Query('categoryIds') categoryIds?: string,
    @Query('priceRange') priceRange?: string,
    @Query('walkMinutes') walkMinutes?: number,
  ) {
    return this.recommendationService.getToday(user.userId, {
      categoryIds,
      priceRange,
      walkMinutes,
    });
  }

  @Post('today/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '추천 새로고침' })
  async refresh(
    @CurrentUser() user: { userId: string },
    @Body() body: { categoryIds?: string[]; priceRange?: string; walkMinutes?: number },
  ) {
    return this.recommendationService.refresh(user.userId, body);
  }
}
