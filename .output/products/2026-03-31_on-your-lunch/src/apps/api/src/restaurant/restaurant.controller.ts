import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common';
import { RestaurantService } from './restaurant.service';

@ApiTags('식당')
@Controller('restaurants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get('search')
  @ApiOperation({ summary: '식당 검색' })
  async search(
    @CurrentUser() user: { userId: string },
    @Query('q') q: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.restaurantService.search(user.userId, q, page, limit);
  }

  @Get('map')
  @ApiOperation({ summary: '식당 지도 핀 조회' })
  async getMapPins(
    @CurrentUser() user: { userId: string },
    @Query('swLat') swLat: number,
    @Query('swLng') swLng: number,
    @Query('neLat') neLat: number,
    @Query('neLng') neLng: number,
    @Query('categoryIds') categoryIds?: string,
  ) {
    return this.restaurantService.getMapPins(user.userId, { swLat, swLng, neLat, neLng, categoryIds });
  }

  @Get(':id')
  @ApiOperation({ summary: '식당 상세 조회' })
  async getDetail(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.restaurantService.getDetail(user.userId, id);
  }

  @Get()
  @ApiOperation({ summary: '식당 탐색 (리스트)' })
  async list(
    @CurrentUser() user: { userId: string },
    @Query('categoryIds') categoryIds?: string,
    @Query('priceRange') priceRange?: string,
    @Query('walkMinutes') walkMinutes?: number,
    @Query('sort') sort?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('favoritesOnly') favoritesOnly?: boolean,
  ) {
    return this.restaurantService.list(user.userId, { categoryIds, priceRange, walkMinutes: walkMinutes ? Number(walkMinutes) : undefined, sort, page, limit, favoritesOnly });
  }
}
