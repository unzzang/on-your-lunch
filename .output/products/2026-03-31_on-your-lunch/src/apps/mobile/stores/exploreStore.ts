// ─────────────────────────────────────────
// 탐색 스토어
//
// 탐색 화면의 뷰 모드(지도/리스트) 상태 유지.
// 탭을 이동했다 돌아왔을 때 마지막 뷰 모드를 기억.
// ─────────────────────────────────────────

import { create } from 'zustand';

type ViewMode = 'map' | 'list';

interface ExploreState {
  // 현재 뷰 모드
  viewMode: ViewMode;

  // 액션
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

export const useExploreStore = create<ExploreState>((set) => ({
  viewMode: 'list',

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleViewMode: () =>
    set((state) => ({
      viewMode: state.viewMode === 'map' ? 'list' : 'map',
    })),
}));
