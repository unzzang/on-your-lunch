import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: { eventName: string; eventData: Record<string, unknown> }) {
    await this.prisma.eventLog.create({
      data: {
        userId,
        eventName: data.eventName,
        eventData: data.eventData,
      },
    });
  }
}
