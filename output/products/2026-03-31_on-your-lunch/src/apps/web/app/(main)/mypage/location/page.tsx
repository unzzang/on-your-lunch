'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CaretLeft, MagnifyingGlass, MapPin } from '@phosphor-icons/react';
import { useMe } from '@/hooks/useMe';
import { useUpdateLocation, useKakaoMaps } from '@/hooks';
import { Toast } from '@/components/ui';

interface SearchResult {
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
}

export default function LocationChangePage() {
  const router = useRouter();
  const { data: me } = useMe();
  const updateLocation = useUpdateLocation();
  const [search, setSearch] = useState('');
  const sdkLoaded = useKakaoMaps();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    buildingName: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const showMarker = useCallback((lat: number, lng: number, name: string) => {
    if (!mapInstanceRef.current) return;
    if (markerRef.current) markerRef.current.setMap(null);
    const pos = new window.kakao.maps.LatLng(lat, lng);
    const el = document.createElement('div');
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="width:36px;height:36px;border-radius:9999px;background:#2563EB;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">🏢</div>
        <span style="font-size:12px;font-weight:600;color:#111827;margin-top:3px;background:white;padding:2px 8px;border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,0.05);white-space:nowrap;">${name}</span>
      </div>
    `;
    const overlay = new window.kakao.maps.CustomOverlay({ position: pos, content: el, yAnchor: 1, map: mapInstanceRef.current });
    markerRef.current = overlay;
    mapInstanceRef.current.setCenter(pos);
  }, []);

  useEffect(() => {
    if (!sdkLoaded || !mapRef.current) return;
    const lat = me?.location?.latitude ?? 37.4979;
    const lng = me?.location?.longitude ?? 127.0276;
    const map = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(lat, lng),
      level: 3,
    });
    mapInstanceRef.current = map;

    if (me?.location) {
      showMarker(lat, lng, me.location.buildingName || '내 회사');
    }
  }, [sdkLoaded, me, showMarker]);

  const handleSearch = () => {
    if (!search.trim() || !sdkLoaded) return;
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(search, (data: SearchResult[], status: string) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setResults(data.slice(0, 5));
      } else {
        setResults([]);
      }
    });
  };

  const handleSelect = (r: SearchResult) => {
    const lat = parseFloat(r.y);
    const lng = parseFloat(r.x);
    setSelected({
      latitude: lat,
      longitude: lng,
      address: r.road_address_name || r.address_name,
      buildingName: r.place_name,
    });
    setResults([]);
    setSearch(r.place_name);
    showMarker(lat, lng, r.place_name);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateLocation.mutateAsync(selected);
      setToast('회사 위치가 변경되었어요');
      setTimeout(() => router.back(), 1200);
    } catch {
      setToast('저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* 앱바 */}
      <div className="flex h-14 items-center gap-2 bg-bg-primary px-4">
        <button onClick={() => router.back()}>
          <CaretLeft size={24} className="text-text-primary" />
        </button>
        <span className="text-lg font-bold text-text-primary">회사 위치 변경</span>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4">
        {/* 현재 위치 */}
        {me?.location && !selected && (
          <div className="mb-3 flex items-start gap-2 rounded-[var(--radius-md)] bg-bg-secondary p-3">
            <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <div className="text-sm text-text-primary">{me.location.address}</div>
              {me.location.buildingName && (
                <div className="text-xs text-text-secondary">{me.location.buildingName}</div>
              )}
            </div>
          </div>
        )}

        {/* 검색 */}
        <div className="relative">
          <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-bg-tertiary px-4 py-3 focus-within:ring-2 focus-within:ring-primary">
            <MagnifyingGlass size={20} className="text-text-placeholder" />
            <input
              type="text"
              placeholder="새 회사 주소 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-transparent text-[15px] text-text-primary outline-none placeholder:text-text-placeholder"
            />
          </div>

          {results.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-[var(--radius-md)] border border-border-default bg-bg-primary shadow-md">
              {results.map((r, i) => (
                <button key={i} className="flex w-full items-start gap-2 px-4 py-3 text-left hover:bg-bg-secondary" onClick={() => handleSelect(r)}>
                  <MapPin size={18} className="mt-0.5 shrink-0 text-text-secondary" />
                  <div>
                    <div className="text-sm font-medium text-text-primary">{r.place_name}</div>
                    <div className="text-xs text-text-secondary">{r.road_address_name || r.address_name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 지도 */}
        <div className="mt-4 h-[240px] overflow-hidden rounded-[var(--radius-lg)]">
          <div ref={mapRef} className="h-full w-full">
            {!sdkLoaded && (
              <div className="flex h-full items-center justify-center bg-bg-tertiary">
                <span className="text-sm text-text-placeholder">지도를 불러오는 중...</span>
              </div>
            )}
          </div>
        </div>

        {/* 선택된 새 주소 */}
        {selected && (
          <div className="mt-4 flex items-start gap-2 rounded-[var(--radius-md)] bg-bg-secondary p-3">
            <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <div className="text-sm text-text-primary">{selected.address}</div>
              <div className="text-xs text-text-secondary">{selected.buildingName}</div>
            </div>
          </div>
        )}

        <div className="flex-1" />

        <button
          onClick={handleSave}
          disabled={!selected || saving}
          className="mt-4 h-12 w-full rounded-[var(--radius-md)] bg-primary text-[16px] font-semibold text-text-inverse transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-primary-disabled"
        >
          {saving ? '저장 중...' : '변경하기'}
        </button>
      </div>

      <Toast message={toast} visible={!!toast} onClose={() => setToast('')} />
    </div>
  );
}
