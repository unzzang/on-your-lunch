import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@/prisma/prisma.service';

// 푸시 알림 문구 (기능 명세서 01 - 3.9항)
// A: 고정 문구, B: 닉네임 삽입, C: 정적 대체 문구 (추천 카테고리 조회 비용 절감)
const NOTIFICATION_MESSAGES = {
  A: '오늘 점심 추천이 도착했어요! 🍽',
  B: (nickname: string) => `${nickname}님, 오늘 점심 3곳 골라봤어요!`,
  C: '오늘은 뭐 먹을까요? 추천 확인하기',
};

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 매 30분마다 실행: 해당 시간에 알림이 설정된 사용자에게 푸시 알림 발송.
   * 실행 시각: 10:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00 (평일만)
   */
  @Cron('0 0,30 10-13 * * 1-5')
  async sendLunchNotifications() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    this.logger.log(`푸시 알림 발송 시작: ${currentTime}`);

    // 해당 시간에 알림 설정된 사용자 조회 (닉네임 포함)
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

    this.logger.log(`발송 대상: ${users.length}명`);

    if (users.length === 0) return;

    // 사용자별 랜덤 문구 선택 (A/B/C 중 하나)
    const messageKeys = ['A', 'B', 'C'] as const;

    const messages = users
      .filter((u): u is typeof u & { expoPushToken: string } => u.expoPushToken !== null)
      .map((u) => {
        const key = messageKeys[Math.floor(Math.random() * messageKeys.length)];
        let body: string;
        if (key === 'B') {
          body = NOTIFICATION_MESSAGES.B(u.nickname);
        } else {
          body = NOTIFICATION_MESSAGES[key];
        }
        return { token: u.expoPushToken, body };
      });

    try {
      await this.sendExpoPushNotificationsPerUser(messages, {
        title: '온유어런치',
        data: { screen: 'home' }, // 딥링크: 앱 홈 화면
      });
      this.logger.log(`푸시 알림 발송 완료: ${messages.length}건`);
    } catch (error) {
      this.logger.error('푸시 알림 발송 실패', error);
    }
  }

  /**
   * Expo Push API로 사용자별 개별 문구 알림 발송
   */
  private async sendExpoPushNotificationsPerUser(
    userMessages: Array<{ token: string; body: string }>,
    notification: { title: string; data?: Record<string, unknown> },
  ) {
    const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
    const CHUNK_SIZE = 100;

    for (let i = 0; i < userMessages.length; i += CHUNK_SIZE) {
      const chunk = userMessages.slice(i, i + CHUNK_SIZE);

      const messages = chunk.map((um) => ({
        to: um.token,
        sound: 'default',
        title: notification.title,
        body: um.body,
        data: notification.data || {},
      }));

      try {
        const response = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messages),
        });

        if (!response.ok) {
          this.logger.error(
            `Expo Push API 오류: ${response.status} ${response.statusText}`,
          );
        }
      } catch (error) {
        this.logger.error(`Expo Push API 호출 실패 (chunk ${i / CHUNK_SIZE + 1})`, error);
      }
    }
  }

  /**
   * Expo Push API로 일괄 알림 발송 (동일 문구)
   * @see https://docs.expo.dev/push-notifications/sending-notifications/
   */
  private async sendExpoPushNotifications(
    pushTokens: string[],
    notification: { title: string; body: string; data?: Record<string, unknown> },
  ) {
    // Expo Push API 엔드포인트
    const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

    // 100개씩 청크로 나눠서 발송 (Expo 제한)
    const CHUNK_SIZE = 100;

    for (let i = 0; i < pushTokens.length; i += CHUNK_SIZE) {
      const chunk = pushTokens.slice(i, i + CHUNK_SIZE);

      const messages = chunk.map((token) => ({
        to: token,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
      }));

      try {
        const response = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messages),
        });

        if (!response.ok) {
          this.logger.error(
            `Expo Push API 오류: ${response.status} ${response.statusText}`,
          );
        }
      } catch (error) {
        this.logger.error(`Expo Push API 호출 실패 (chunk ${i / CHUNK_SIZE + 1})`, error);
      }
    }
  }
}
