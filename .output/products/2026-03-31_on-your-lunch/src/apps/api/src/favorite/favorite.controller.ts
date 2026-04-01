import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common';
import { FavoriteService } from './favorite.service';

@ApiTags('즐겨찾기')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '즐겨찾기 토글' })
  async toggle(
    @CurrentUser() user: { userId: string },
    @Body() body: { restaurantId: string },
  ) {
    return this.favoriteService.toggle(user.userId, body.restaurantId);
  }
}
