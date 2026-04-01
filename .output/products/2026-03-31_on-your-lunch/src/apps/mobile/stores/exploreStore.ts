import { create } from 'zustand';

/**
 * 탐색 스토어
 * 탐색 화면의 뷰 모드(지도/리스트) 상태를 유지한다.
 */

type ViewMode = 'map' | 'list';

interface ExploreState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

export const useExploreStore = create<ExploreState>((set) => ({
  viewMode: 'list',

  setViewMode: (viewMode) => set({ viewMode }),

  toggleViewMode: () =>
    set((state) => ({
      viewMode: state.viewMode === 'map' ? 'list' : 'map',
    })),
}));
