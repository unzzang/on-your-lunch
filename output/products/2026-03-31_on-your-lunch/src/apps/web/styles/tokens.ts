/**
 * 디자인 토큰 (TypeScript 참조용)
 * CSS 변수(:root)와 Tailwind @theme에도 동일 값이 선언되어 있다.
 * 이 파일은 JS에서 토큰 값이 필요할 때 import한다.
 */

export const colors = {
  primary: '#D4501F',
  primaryHover: '#B8441A',
  primaryDisabled: '#E8A78E',
  secondary: '#6B7280',
  destructive: '#DC2626',
  success: '#16A34A',
  warning: '#F59E0B',

  bgPrimary: '#FFFFFF',
  bgSecondary: '#F9FAFB',
  bgTertiary: '#F3F4F6',

  borderDefault: '#E5E7EB',
  borderFocus: '#D4501F',

  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textPlaceholder: '#9CA3AF',
  textInverse: '#FFFFFF',

  overlay: 'rgba(0, 0, 0, 0.5)',
  toastBg: '#1F2937',

  rating: '#FBBF24',

  categoryKorean: '#FF8C00',
  categoryChinese: '#FF0000',
  categoryJapanese: '#0066FF',
  categoryWestern: '#00AA00',
  categoryAsian: '#9900CC',
  categorySnack: '#FFCC00',
  categorySalad: '#66CC00',
} as const;

export const radius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.07)',
  lg: '0 10px 15px rgba(0,0,0,0.10)',
} as const;

/** 카테고리별 색상 매핑 */
export const categoryColorMap: Record<string, string> = {
  한식: colors.categoryKorean,
  중식: colors.categoryChinese,
  일식: colors.categoryJapanese,
  양식: colors.categoryWestern,
  아시안: colors.categoryAsian,
  분식: colors.categorySnack,
  샐러드: colors.categorySalad,
};
