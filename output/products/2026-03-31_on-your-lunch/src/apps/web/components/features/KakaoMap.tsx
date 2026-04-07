'use client';

import { useEffect, useRef } from 'react';
import type { RestaurantMapPin } from '@on-your-lunch/shared-types';
import { useKakaoMaps } from '@/hooks/useKakaoMaps';

interface KakaoMapProps {
  pins: RestaurantMapPin[];
  companyLatitude?: number;
  companyLongitude?: number;
  onPinClick?: (pin: RestaurantMapPin) => void;
}

export default function KakaoMap({
  pins,
  companyLatitude = 37.5665,
  companyLongitude = 126.978,
  onPinClick,
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const sdkLoaded = useKakaoMaps();

  /* 지도 초기화 */
  useEffect(() => {
    if (!sdkLoaded || !mapRef.current) return;

    const center = new window.kakao.maps.LatLng(companyLatitude, companyLongitude);
    const map = new window.kakao.maps.Map(mapRef.current, {
      center,
      level: 4,
    });
    mapInstanceRef.current = map;

    /* 내 회사 마커 */
    const companyMarkerEl = document.createElement('div');
    companyMarkerEl.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
        <div style="width:32px;height:32px;border-radius:9999px;background:#111827;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 4px 6px rgba(0,0,0,0.07);">🏢</div>
        <span style="font-size:11px;font-weight:600;color:#111827;margin-top:2px;background:white;padding:2px 6px;border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,0.05);white-space:nowrap;">내 회사</span>
      </div>
    `;
    new window.kakao.maps.CustomOverlay({
      position: center,
      content: companyMarkerEl,
      yAnchor: 1,
      map,
    });

    return () => {
      markersRef.current = [];
    };
  }, [sdkLoaded, companyLatitude, companyLongitude]);

  /* 핀 업데이트 */
  useEffect(() => {
    if (!sdkLoaded || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    /* 기존 마커 제거 */
    markersRef.current.forEach((overlay) => overlay.setMap(null));
    markersRef.current = [];

    pins.forEach((pin) => {
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
          <div style="width:32px;height:32px;border-radius:9999px;background:${pin.categoryColorCode};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:white;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
            <svg width="16" height="16" viewBox="0 0 256 256" fill="white"><path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80,132.17,83.41,134.55a8,8,0,0,0,9.18,0C136,236.17,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,56a32,32,0,1,1-32,32A32,32,0,0,1,128,72Z"/></svg>
          </div>
          <span style="font-size:11px;font-weight:600;color:#111827;margin-top:2px;background:white;padding:2px 6px;border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,0.05);white-space:nowrap;">${pin.name}</span>
        </div>
      `;
      el.addEventListener('click', () => onPinClick?.(pin));

      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(pin.latitude, pin.longitude),
        content: el,
        yAnchor: 1,
        map,
      });
      markersRef.current.push(overlay);
    });
  }, [sdkLoaded, pins, onPinClick]);

  return (
    <div ref={mapRef} className="h-full w-full">
      {!sdkLoaded && (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-bg-tertiary">
          <span className="text-5xl text-text-placeholder">🗺</span>
          <span className="text-sm text-text-placeholder">
            지도를 불러오는 중...
          </span>
        </div>
      )}
    </div>
  );
}
