import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ShareService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * User-Agent 기반으로 적절한 리다이렉트 URL을 반환한다.
   * - 모바일 + 앱 설치: onyourlunch://restaurant/{id} (Universal Link / App Link)
   * - 모바일 + 앱 미설치: 스토어 URL
   * - 데스크톱: 안내 페이지
   */
  async getRedirectUrl(restaurantId: string, userAgent: string): Promise<string> {
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iphone|ipad/i.test(userAgent);

    if (isMobile) {
      // 앱 스킴 URL (Universal Link / App Link)
      // 앱이 설치되어 있으면 자동으로 앱이 열림
      // 미설치 시 폴백으로 스토어로 이동
      if (isAndroid) {
        // Android Intent 기반 딥링크 (앱 미설치 시 Play Store로 폴백)
        const packageName = this.configService.get<string>(
          'ANDROID_PACKAGE_NAME',
          'kr.onyourlunch.app',
        );
        return `intent://restaurant/${restaurantId}#Intent;scheme=onyourlunch;package=${packageName};end`;
      }

      if (isIOS) {
        // iOS Universal Link (앱 미설치 시 App Store로 폴백)
        const appStoreUrl = this.configService.get<string>(
          'IOS_APP_STORE_URL',
          'https://apps.apple.com/app/onyourlunch',
        );
        // Universal Link 처리가 안 될 경우를 위해 앱 스킴을 먼저 시도
        return `onyourlunch://restaurant/${restaurantId}`;
      }

      // 기타 모바일
      return `onyourlunch://restaurant/${restaurantId}`;
    }

    // 데스크톱: 안내 페이지
    const webBaseUrl = this.configService.get<string>(
      'WEB_BASE_URL',
      'https://onyourlunch.kr',
    );
    return `${webBaseUrl}/share/guide?restaurantId=${restaurantId}`;
  }
}
