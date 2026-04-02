import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(private prisma: PrismaService) {}

  /** POST /events — 이벤트 기록 (fire-and-forget) */
  async create(userId: string, eventName: string, eventData: Record<string, any> = {}) {
    try {
      await this.prisma.eventLog.create({
        data: {
          userId,
          eventName,
          eventData,
        },
      });
    } catch (error) {
      // 이벤트 로그 실패는 사용자 경험에 영향을 주지 않는다.
      this.logger.warn(`이벤트 로그 저장 실패: ${eventName}`, error);
    }

    return null;
  }
}
