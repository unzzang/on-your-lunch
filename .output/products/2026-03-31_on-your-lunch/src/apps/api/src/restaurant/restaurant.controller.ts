import { Controller, Get, Param, Query } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SearchRestaurantDto } from './dto/search-restaurant.dto';
import { ListRestaurantDto } from './dto/list-restaurant.dto';
import { MapRestaurantDto } from './dto/map-restaurant.dto';

@Controller('restaurants')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  /** GET /restaurants/search — 식당 검색 (search가 :id보다 먼저 매칭되도록 위에 배치) */
  @Get('search')
  search(
    @Query() dto: SearchRestaurantDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.restaurantService.search(dto.q, dto.page!, dto.limit!, user.id);
  }

  /** GET /restaurants/map — 지도 핀 */
  @Get('map')
  mapPins(
    @Query() dto: MapRestaurantDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.restaurantService.findMapPins(
      dto.swLat, dto.swLng, dto.neLat, dto.neLng,
      dto.categoryIds, user.id,
    );
  }

  /** GET /restaurants — 식당 탐색 리스트 */
  @Get()
  findAll(
    @Query() dto: ListRestaurantDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.restaurantService.findAll(
      dto.categoryIds, dto.sort!, dto.page!, dto.limit!, dto.favoritesOnly!, user.id,
    );
  }

  /** GET /restaurants/:id — 식당 상세 조회 */
  @Get(':id')
  findById(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.restaurantService.findById(id, user.id);
  }
}
