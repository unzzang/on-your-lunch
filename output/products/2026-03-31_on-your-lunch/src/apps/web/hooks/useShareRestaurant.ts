'use client';

import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse, ShareLinkResponse } from '@on-your-lunch/shared-types';

/** 식당 공유 링크 조회 + Web Share API 또는 클립보드 복사 */
export function useShareRestaurant() {
  return useMutation({
    mutationFn: async (restaurantId: string) => {
      const res = await api
        .get(`share/restaurant/${restaurantId}`)
        .json<ApiResponse<ShareLinkResponse>>();
      return res.data;
    },
    onSuccess: async (data) => {
      const shareData = {
        title: data.restaurantName,
        text: `${data.restaurantName} - 온유어런치에서 확인하세요!`,
        url: data.shareUrl,
      };

      try {
        if (navigator.share && navigator.canShare?.(shareData)) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(data.shareUrl);
          // 클립보드 복사 성공 - 호출하는 쪽에서 토스트 등으로 처리
        }
      } catch {
        // 사용자가 공유 취소한 경우 무시
      }
    },
  });
}
