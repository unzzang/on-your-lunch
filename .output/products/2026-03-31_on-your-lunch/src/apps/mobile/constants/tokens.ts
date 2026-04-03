/**
 * 온유어런치 디자인 토큰
 * 출처: docs/005_design/2026-03-30(일)_design-system.md
 */

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

  overlay: 'rgba(0,0,0,0.5)',
  toastBg: '#1F2937',

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

export const typo = {
  display: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  h1: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  body1: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  body2: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  overline: { fontSize: 11, fontWeight: '500' as const, lineHeight: 16 },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const shadow = {
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

// alias (자동 생성된 파일과의 호환)
export const Colors = colors;
export const Typography = typo;
export const Spacing = spacing;
export const Radius = radius;
export const Shadow = shadow;
