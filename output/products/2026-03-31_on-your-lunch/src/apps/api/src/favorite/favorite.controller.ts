import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { FavoriteService } from './favorite.service';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { FavoriteToggleDto, FavoriteToggleResponseDto } from './dto/favorite-toggle.dto';

@ApiTags('즐겨찾기')
@ApiBearerAuth()
@ApiExtraModels(FavoriteToggleResponseDto)
@Controller('favorites')
export class FavoriteController {
  constructor(private favoriteService: FavoriteService) {}

  @Get()
  @ApiOperation({ summary: '즐겨찾기 목록 조회' })
  @ApiResponse({ status: 200, description: '즐겨찾기 목록. data 필드 안에 { items, totalCount } 반환.' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.favoriteService.findAll(user.id);
  }

  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '즐겨찾기 토글 (추가/해제)' })
  @ApiResponse({ status: 200, description: '토글 결과. data 필드 안에 반환.', type: FavoriteToggleResponseDto })
  toggle(@CurrentUser() user: JwtPayload, @Body() dto: FavoriteToggleDto) {
    return this.favoriteService.toggle(user.id, dto.restaurantId);
  }
}
