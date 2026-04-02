import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/** 푸시 알림 문구 3가지 중 랜덤 선택 */
const NOTIFICATION_MESSAGES = [
  '오늘 점심 추천이 도착했어요! 🍽',
  '{nickname}님, 오늘 점심 3곳 골라봤어요!',
  '오늘은 뭐 먹을까요? 추천 확인하기',
];

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 매 30분마다 실행 (10:00, 10:30, 11:00, ... 13:00)
   * 해당 시간에 알림 설정된 사용자에게 푸시 알림 발송
   */
  @Cron('0,30 10-13 * * 1-5') // 평일 10:00~13:30 매 30분
  async sendScheduledNotifications() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes() < 15 ? '00' : '30';
    const currentTime = `${hours}:${minutes}`;

    this.logger.log(`스케줄 알림 실행: ${currentTime}`);

    // 해당 시간에 알림 설정된 + 활성 사용자 + 푸시 토큰 있는 사용자 조회
    const users = await this.prisma.user.findMany({
      where: {
        notificationEnabled: true,
        notificationTime: currentTime,
        expoPushToken: { not: null },
        deletedAt: null,
      },
      select: {
        id: true,
        nickname: true,
        expoPushToken: true,
      },
    });

    if (users.length === 0) {
      this.logger.log(`${currentTime} 알림 대상 없음`);
      return;
    }

    this.logger.log(`${currentTime} 알림 대상: ${users.length}명`);

    // 각 사용자에게 푸시 알림 발송
    for (const user of users) {
      const message = this.getRandomMessage(user.nickname);
      await this.sendPushNotification(user.expoPushToken!, message);
    }
  }

  /** 랜덤 알림 문구 선택 */
  private getRandomMessage(nickname: string): string {
    const index = Math.floor(Math.random() * NOTIFICATION_MESSAGES.length);
    return NOTIFICATION_MESSAGES[index].replace('{nickname}', nickname);
  }

  /** Expo Push API 호출 (실제 구현) */
  private async sendPushNotification(expoPushToken: string, message: string) {
    try {
      // Expo Push API 호출
      // 프로덕션에서는 expo-server-sdk 패키지 사용 권장
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: expoPushToken,
          sound: 'default',
          title: '온유어런치',
          body: message,
          data: { screen: 'home' }, // 딥링크: 홈 화면으로 이동
        }),
      });

      if (!response.ok) {
        this.logger.warn(`푸시 발송 실패: ${expoPushToken} - ${response.status}`);
      }
    } catch (error) {
      this.logger.error(`푸시 발송 에러: ${expoPushToken}`, error);
    }
  }
}
