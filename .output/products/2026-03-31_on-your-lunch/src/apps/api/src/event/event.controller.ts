import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { EventService } from './event.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
export class EventController {
  constructor(private eventService: EventService) {}

  /** POST /events — 이벤트 로그 기록 */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateEventDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.eventService.create(user.id, dto.eventName, dto.eventData ?? {});
  }
}
