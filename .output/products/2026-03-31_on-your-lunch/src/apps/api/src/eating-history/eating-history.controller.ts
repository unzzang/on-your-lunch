import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EatingHistoryService } from './eating-history.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateEatingHistoryDto } from './dto/create-eating-history.dto';
import { CreateCustomEatingHistoryDto } from './dto/create-custom-eating-history.dto';
import { UpdateEatingHistoryDto } from './dto/update-eating-history.dto';
import { CalendarQueryDto } from './dto/calendar-query.dto';

@Controller('eating-histories')
export class EatingHistoryController {
  constructor(private eatingHistoryService: EatingHistoryService) {}

  /** GET /eating-histories/calendar — 캘린더 조회 (calendar가 :id보다 먼저 매칭) */
  @Get('calendar')
  getCalendar(
    @Query() dto: CalendarQueryDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.eatingHistoryService.getCalendar(user.id, dto.year, dto.month);
  }

  /** POST /eating-histories — 먹었어요 기록 */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateEatingHistoryDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.eatingHistoryService.create(
      user.id,
      dto.restaurantId,
      dto.eatenDate,
      dto.rating,
      dto.memo,
      dto.isFromRecommendation,
    );
  }

  /** POST /eating-histories/custom — 직접 입력 식당 기록 */
  @Post('custom')
  @HttpCode(HttpStatus.CREATED)
  createCustom(
    @Body() dto: CreateCustomEatingHistoryDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.eatingHistoryService.createCustom(
      user.id,
      dto.restaurantName,
      dto.categoryId,
      dto.eatenDate,
      dto.rating,
      dto.memo,
    );
  }

  /** PATCH /eating-histories/:id — 수정 */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEatingHistoryDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.eatingHistoryService.update(id, user.id, dto.rating, dto.memo);
  }

  /** DELETE /eating-histories/:id — 삭제 */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.eatingHistoryService.delete(id, user.id);
  }
}
