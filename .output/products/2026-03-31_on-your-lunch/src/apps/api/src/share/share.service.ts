import { Injectable } from '@nestjs/common';

@Injectable()
export class ShareService {
  /**
   * User-Agent에 따라 적절한 리다이렉트 URL을 반환한다.
   * - 모바일 + 앱 설치: 커스텀 스킴으로 앱 오픈
   * - 모바일 + 앱 미설치: 앱스토어/플레이스토어
   * - 데스크톱: 안내 페이지
   */
  getRedirectUrl(restaurantId: string, userAgent: string): string {
    const isMobile = /iPhone|iPad|Android/i.test(userAgent);
    const isIOS = /iPhone|iPad/i.test(userAgent);

    if (isMobile) {
      // 커스텀 스킴으로 앱 오픈 시도
      // 실제로는 Universal Links / App Links 설정이 필요하지만,
      // MVP에서는 커스텀 스킴 fallback으로 처리
      return `onyourlunch://restaurant/${restaurantId}`;
    }

    // 데스크톱: 간단한 안내 페이지 (실제로는 랜딩 페이지 URL)
    return `https://onyourlunch.kr/app?restaurant=${restaurantId}`;
  }
}
