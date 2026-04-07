import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 매 30분마다 실행 (10:00 ~ 13:00)
   * 해당 시간에 알림 설정된 사용자에게 푸시 발송
   */
  @Cron('0 0,30 10,11,12,13 * * *')
  async sendScheduledNotifications() {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const users = await this.prisma.user.findMany({
      where: {
        notificationEnabled: true,
        notificationTime: timeStr,
        expoPushToken: { not: null },
        deletedAt: null,
      },
      select: { id: true, expoPushToken: true, nickname: true },
    });

    if (users.length === 0) return;

    this.logger.log(
      `${timeStr} 알림 대상: ${users.length}명`,
    );

    // Expo Push API 호출 (추후 구현)
    // 현재는 로그만 출력
    for (const user of users) {
      this.logger.debug(
        `푸시 발송 예정: ${user.nickname} (${user.expoPushToken})`,
      );
    }
  }
}
