/**
 * 디자인 토큰 상수
 * 디자인 시스템 문서: .docs/005_design/2026-03-30(일)_design-system.md
 */

// ── 색상 ──
export const colors = {
  primary: '#D4501F',
  primaryHover: '#B8441A',
  primaryDisabled: '#E8A78E',
  secondary: '#6B7280',
  destructive: '#DC2626',
  success: '#16A34A',
  warning: '#F59E0B',

  bg: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },

  border: {
    default: '#E5E7EB',
    focus: '#D4501F',
  },

  text: {
    primary: '#111827',
    secondary: '#6B7280',
    placeholder: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  overlay: 'rgba(0, 0, 0, 0.5)',
  toastBg: '#1F2937',

  // 카테고리 색상 (ERD CATEGORY 테이블 color_code 일치)
  category: {
    korean: '#FF8C00',
    chinese: '#FF0000',
    japanese: '#0066FF',
    western: '#00AA00',
    asian: '#9900CC',
    snack: '#FFCC00',
    salad: '#66CC00',
  },

  rating: '#FBBF24',
} as const;

// ── 타이포그래피 ──
export const typography = {
  fontFamily: 'Pretendard',

  display: { size: 28, weight: '700' as const, lineHeight: 36 },
  h1: { size: 24, weight: '700' as const, lineHeight: 32 },
  h2: { size: 20, weight: '600' as const, lineHeight: 28 },
  h3: { size: 18, weight: '600' as const, lineHeight: 26 },
  body1: { size: 16, weight: '400' as const, lineHeight: 24 },
  body2: { size: 14, weight: '400' as const, lineHeight: 20 },
  caption: { size: 12, weight: '400' as const, lineHeight: 16 },
  overline: { size: 11, weight: '500' as const, lineHeight: 16 },
} as const;

// ── 간격 (4px 그리드) ──
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
} as const;

// ── 모서리 반경 ──
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// ── 그림자 ──
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
} as const;

// ── 아이콘 크기 ──
export const iconSize = {
  inline: 16,
  button: 20,
  nav: 24,
} as const;

// ── Z-index ──
export const zIndex = {
  content: 0,
  stickyHeader: 100,
  dropdown: 200,
  modalOverlay: 300,
  modal: 400,
  toast: 500,
} as const;
