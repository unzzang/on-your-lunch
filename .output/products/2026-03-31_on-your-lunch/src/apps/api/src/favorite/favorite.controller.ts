import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';

@Controller('favorites')
export class FavoriteController {
  constructor(private favoriteService: FavoriteService) {}

  /** POST /favorites/toggle — 즐겨찾기 토글 */
  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  toggle(
    @Body() dto: ToggleFavoriteDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.favoriteService.toggle(user.id, dto.restaurantId);
  }
}
