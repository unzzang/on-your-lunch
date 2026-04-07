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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExtraModels, ApiQuery } from '@nestjs/swagger';
import { EatingHistoryService } from './eating-history.service';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import {
  CreateEatingHistoryDto,
  CreateCustomEatingHistoryDto,
  UpdateEatingHistoryDto,
} from './dto/create-eating-history.dto';
import { EatingHistoryItemDto, CalendarResponseDto } from './dto/eating-history-response.dto';

@ApiTags('식사 기록')
@ApiBearerAuth()
@ApiExtraModels(EatingHistoryItemDto, CalendarResponseDto)
@Controller('eating-histories')
export class EatingHistoryController {
  constructor(private eatingHistoryService: EatingHistoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '식사 기록 생성 (등록된 식당)' })
  @ApiResponse({ status: 201, description: '기록 생성 성공. data 필드 안에 반환.', type: EatingHistoryItemDto })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateEatingHistoryDto) {
    return this.eatingHistoryService.create(user.id, dto);
  }

  @Post('custom')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '식사 기록 생성 (직접 입력)' })
  @ApiResponse({ status: 201, description: '커스텀 기록 생성 성공. data 필드 안에 반환.', type: EatingHistoryItemDto })
  createCustom(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCustomEatingHistoryDto,
  ) {
    return this.eatingHistoryService.createCustom(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '식사 기록 수정 (평점, 메모)' })
  @ApiResponse({ status: 200, description: '기록 수정 성공. data 필드 안에 반환.', type: EatingHistoryItemDto })
  @ApiResponse({ status: 404, description: '기록을 찾을 수 없음' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateEatingHistoryDto,
  ) {
    return this.eatingHistoryService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '식사 기록 삭제' })
  @ApiResponse({ status: 200, description: '기록 삭제 성공. data 필드 안에 { message: "삭제 완료" } 반환.' })
  @ApiResponse({ status: 404, description: '기록을 찾을 수 없음' })
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.eatingHistoryService.delete(user.id, id);
  }

  @Get('calendar')
  @ApiOperation({ summary: '월별 식사 캘린더 조회' })
  @ApiQuery({ name: 'year', required: true, description: '연도', example: '2026' })
  @ApiQuery({ name: 'month', required: true, description: '월 (1~12)', example: '4' })
  @ApiResponse({ status: 200, description: '날짜별 식사 기록. data 필드 안에 반환.', type: CalendarResponseDto })
  getCalendar(
    @CurrentUser() user: JwtPayload,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.eatingHistoryService.getCalendar(
      user.id,
      parseInt(year, 10),
      parseInt(month, 10),
    );
  }
}
