import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, eventName: string, eventData: Prisma.InputJsonValue = {}) {
    const event = await this.prisma.eventLog.create({
      data: {
        userId,
        eventName,
        eventData,
      },
    });
    return { id: event.id, eventName: event.eventName };
  }
}
