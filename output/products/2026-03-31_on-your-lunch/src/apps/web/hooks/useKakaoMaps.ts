'use client';

import { useState, useEffect } from 'react';

declare global {
  interface Window {
    kakao: any;
    __KAKAO_MAPS_LOADED__?: boolean;
  }
}

export function useKakaoMaps() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 이미 로드된 경우
    if (window.__KAKAO_MAPS_LOADED__ && window.kakao?.maps) {
      setLoaded(true);
      return;
    }

    // 아직 로드 안 된 경우 이벤트 리스너
    const handler = () => setLoaded(true);
    window.addEventListener('kakao-maps-loaded', handler);
    return () => window.removeEventListener('kakao-maps-loaded', handler);
  }, []);

  return loaded;
}
