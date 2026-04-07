import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다.');
    }
    const adapter = new PrismaPg({ connectionString });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma 7 driver adapter requires this cast
    super({ adapter } as any);
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma 연결 완료');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma 연결 해제');
  }
}
