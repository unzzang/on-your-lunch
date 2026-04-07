import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { RestaurantService } from './restaurant.service';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import {
  RestaurantListDto,
  RestaurantSearchDto,
  RestaurantMapDto,
} from './dto/restaurant-query.dto';
import {
  RestaurantDetailResponseDto,
  RestaurantPaginatedResponseDto,
  RestaurantMapResponseDto,
} from './dto/restaurant-response.dto';

@ApiTags('식당')
@ApiBearerAuth()
@ApiExtraModels(RestaurantPaginatedResponseDto, RestaurantDetailResponseDto, RestaurantMapResponseDto)
@Controller('restaurants')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Get('search')
  @ApiOperation({ summary: '식당 검색 (이름 기반)' })
  @ApiResponse({ status: 200, description: '검색 결과 목록. data 필드 안에 { items, meta } 반환.', type: RestaurantPaginatedResponseDto })
  search(@CurrentUser() user: JwtPayload, @Query() dto: RestaurantSearchDto) {
    return this.restaurantService.search(user.id, {
      q: dto.q,
      page: dto.page ?? 1,
      limit: dto.limit ?? 20,
    });
  }

  @Get('map')
  @ApiOperation({ summary: '지도 영역 내 식당 핀 조회' })
  @ApiResponse({ status: 200, description: '핀 배열. data 필드 안에 { pins, totalCount } 반환.', type: RestaurantMapResponseDto })
  findMapPins(@CurrentUser() user: JwtPayload, @Query() dto: RestaurantMapDto) {
    return this.restaurantService.findMapPins(user.id, {
      swLat: dto.swLat,
      swLng: dto.swLng,
      neLat: dto.neLat,
      neLng: dto.neLng,
      categoryIds: dto.categoryIds,
      priceRange: dto.priceRange,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '식당 상세 조회' })
  @ApiResponse({ status: 200, description: '식당 상세 정보. data 필드 안에 반환.', type: RestaurantDetailResponseDto })
  @ApiResponse({ status: 404, description: '식당을 찾을 수 없음' })
  findById(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.restaurantService.findById(id, user.id);
  }

  @Get()
  @ApiOperation({ summary: '식당 목록 조회 (필터, 정렬, 페이지네이션)' })
  @ApiResponse({ status: 200, description: '식당 목록. data 필드 안에 { items, meta } 반환.', type: RestaurantPaginatedResponseDto })
  findMany(@CurrentUser() user: JwtPayload, @Query() dto: RestaurantListDto) {
    return this.restaurantService.findMany(user.id, {
      categoryIds: dto.categoryIds,
      priceRange: dto.priceRange,
      maxWalkMinutes: dto.maxWalkMinutes,
      sort: dto.sort,
      page: dto.page ?? 1,
      limit: dto.limit ?? 20,
      favoritesOnly: dto.favoritesOnly ?? false,
    });
  }
}
