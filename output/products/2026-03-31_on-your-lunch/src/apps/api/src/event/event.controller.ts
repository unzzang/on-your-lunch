import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventService } from './event.service';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { CreateEventDto } from './dto/create-event.dto';

@ApiTags('이벤트 트래킹')
@ApiBearerAuth()
@Controller('events')
export class EventController {
  constructor(private eventService: EventService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '사용자 이벤트 기록' })
  @ApiResponse({ status: 201, description: '이벤트 기록 성공. data 필드 안에 { id, eventName } 반환.' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateEventDto) {
    return this.eventService.create(user.id, dto.eventName, dto.eventData ?? {});
  }
}
