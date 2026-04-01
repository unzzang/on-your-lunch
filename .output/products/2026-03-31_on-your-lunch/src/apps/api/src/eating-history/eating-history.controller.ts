import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common';
import { EatingHistoryService } from './eating-history.service';

@ApiTags('먹은 이력')
@Controller('eating-histories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EatingHistoryController {
  constructor(private readonly eatingHistoryService: EatingHistoryService) {}

  @Post()
  @ApiOperation({ summary: '먹었어요 기록' })
  async create(
    @CurrentUser() user: { userId: string },
    @Body()
    body: {
      restaurantId: string;
      eatenDate: string;
      rating: number;
      memo?: string;
      isFromRecommendation: boolean;
    },
  ) {
    return this.eatingHistoryService.create(user.userId, body);
  }

  @Post('custom')
  @ApiOperation({ summary: 'DB에 없는 식당 직접 기록' })
  async createCustom(
    @CurrentUser() user: { userId: string },
    @Body()
    body: {
      restaurantName: string;
      categoryId: string;
      eatenDate: string;
      rating: number;
      memo?: string;
    },
  ) {
    return this.eatingHistoryService.createCustom(user.userId, body);
  }

  @Get('calendar')
  @ApiOperation({ summary: '먹은 이력 캘린더 조회 (월별)' })
  async getCalendar(
    @CurrentUser() user: { userId: string },
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.eatingHistoryService.getCalendar(user.userId, year, month);
  }

  @Patch(':id')
  @ApiOperation({ summary: '먹은 이력 수정' })
  async update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() body: { rating?: number; memo?: string },
  ) {
    return this.eatingHistoryService.update(user.userId, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '먹은 이력 삭제' })
  async delete(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.eatingHistoryService.delete(user.userId, id);
  }
}
