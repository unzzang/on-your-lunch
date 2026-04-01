import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common';
import { EventService } from './event.service';

@ApiTags('이벤트')
@Controller('events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '이벤트 로그 기록' })
  async create(
    @CurrentUser() user: { userId: string },
    @Body() body: { eventName: string; eventData: Record<string, unknown> },
  ) {
    await this.eventService.create(user.userId, body);
    return null;
  }
}
