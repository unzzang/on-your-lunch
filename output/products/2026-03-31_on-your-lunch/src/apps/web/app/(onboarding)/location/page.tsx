'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CaretLeft,
  MagnifyingGlass,
  MapPin,
  WifiSlash,
} from '@phosphor-icons/react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useUpdateLocation, useKakaoMaps } from '@/hooks';

interface SearchResult {
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
}

function ProgressBar({ filled }: { filled: number }) {
  return (
    <div className="mb-6 flex gap-1">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full ${
            i <= filled ? 'bg-primary' : 'bg-bg-tertiary'
          }`}
        />
      ))}
    </div>
  );
}

export default function LocationPage() {
  const router = useRouter();
  const store = useOnboardingStore();
  const updateLocation = useUpdateLocation();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sdkLoaded = useKakaoMaps();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  /* 지도 초기화 */
  useEffect(() => {
    if (!sdkLoaded || !mapRef.current) return;
    const lat = store.latitude || 37.4979;
    const lng = store.longitude || 127.0276;
    const center = new window.kakao.maps.LatLng(lat, lng);
    const map = new window.kakao.maps.Map(mapRef.current, {
      center,
      level: 3,
    });
    mapInstanceRef.current = map;
  }, [sdkLoaded, store.latitude, store.longitude]);

  /* 선택된 위치에 마커 표시 */
  const showMarker = useCallback(
    (lat: number, lng: number, name: string) => {
      if (!mapInstanceRef.current) return;
      const map = mapInstanceRef.current;
      const position = new window.kakao.maps.LatLng(lat, lng);

      if (markerRef.current) markerRef.current.setMap(null);

      const el = document.createElement('div');
      el.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:36px;height:36px;border-radius:9999px;background:#2563EB;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">🏢</div>
          <span style="font-size:12px;font-weight:600;color:#111827;margin-top:3px;background:white;padding:2px 8px;border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,0.05);white-space:nowrap;">${name}</span>
        </div>
      `;
      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content: el,
        yAnchor: 1,
        map,
      });
      markerRef.current = overlay;
      map.setCenter(position);
    },
    [],
  );

  /* 카카오 키워드 검색 */
  const handleSearch = useCallback(() => {
    if (!search.trim() || !sdkLoaded) return;
    setSearching(true);
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(search, (data: SearchResult[], status: string) => {
      setSearching(false);
      if (status === window.kakao.maps.services.Status.OK) {
        setResults(data.slice(0, 5));
      } else {
        setResults([]);
      }
    });
  }, [search, sdkLoaded]);

  /* 검색 결과 선택 */
  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.y);
    const lng = parseFloat(result.x);
    const address = result.road_address_name || result.address_name;
    store.setLocation({
      latitude: lat,
      longitude: lng,
      address,
      buildingName: result.place_name,
    });
    setResults([]);
    setSearch(result.place_name);
    showMarker(lat, lng, result.place_name);
  };

  const handleNext = async () => {
    if (!store.latitude || !store.longitude) return;

    setLoading(true);
    setError(false);
    try {
      await updateLocation.mutateAsync({
        latitude: store.latitude,
        longitude: store.longitude,
        address: store.address,
        buildingName: store.buildingName || undefined,
      });
      router.push('/preference');
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <WifiSlash size={48} className="text-text-placeholder" />
        <p className="text-[16px] text-text-secondary">
          위치 저장에 실패했어요
        </p>
        <button
          onClick={() => setError(false)}
          className="mt-2 rounded-[var(--radius-md)] bg-primary px-6 py-3 text-sm font-semibold text-text-inverse"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-6">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 py-3 text-sm text-text-secondary"
      >
        <CaretLeft size={20} />
        뒤로
      </button>

      <ProgressBar filled={2} />

      <span className="mb-4 text-xs text-text-secondary">Step 1/3</span>
      <h2 className="text-[20px] font-bold leading-[30px] text-text-primary">
        회사가 어디인가요?
      </h2>
      <p className="mt-2 text-sm leading-5 text-text-secondary">
        추천할 때 이 위치 기준으로 가까운 식당을 찾아드려요.
      </p>

      {/* 검색 인풋 */}
      <div className="relative mt-6">
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-transparent bg-bg-tertiary px-4 py-3 focus-within:border-primary">
          <MagnifyingGlass size={20} className="text-text-placeholder" />
          <input
            type="text"
            placeholder="건물명 또는 주소 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-transparent text-[15px] text-text-primary outline-none placeholder:text-text-placeholder"
          />
          {searching && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          )}
        </div>

        {/* 검색 결과 드롭다운 */}
        {results.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-[var(--radius-md)] border border-border-default bg-bg-primary shadow-md">
            {results.map((r, i) => (
              <button
                key={i}
                className="flex w-full items-start gap-2 px-4 py-3 text-left hover:bg-bg-secondary"
                onClick={() => handleSelectResult(r)}
              >
                <MapPin size={18} className="mt-0.5 shrink-0 text-text-secondary" />
                <div>
                  <div className="text-sm font-medium text-text-primary">{r.place_name}</div>
                  <div className="text-xs text-text-secondary">
                    {r.road_address_name || r.address_name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 카카오맵 */}
      <div className="mt-4 h-[200px] overflow-hidden rounded-[var(--radius-lg)]">
        <div ref={mapRef} className="h-full w-full">
          {!sdkLoaded && (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-bg-tertiary">
              <MapPin size={32} className="text-text-placeholder" />
              <span className="text-[13px] text-text-placeholder">
                지도를 불러오는 중...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 주소 표시 */}
      {store.address && (
        <div className="mt-4 flex items-start gap-2 rounded-[var(--radius-md)] bg-bg-secondary p-3">
          <MapPin size={20} className="mt-0.5 shrink-0 text-primary" />
          <div>
            <div className="text-sm text-text-primary">{store.address}</div>
            {store.buildingName && (
              <div className="text-[13px] text-text-secondary">
                {store.buildingName}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1" />

      <button
        onClick={handleNext}
        disabled={!store.latitude || loading}
        className="mb-10 h-12 w-full rounded-[var(--radius-md)] bg-primary text-[16px] font-semibold text-text-inverse transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-primary-disabled"
      >
        {loading ? (
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-text-inverse border-t-transparent" />
        ) : (
          '다음'
        )}
      </button>
    </div>
  );
}
