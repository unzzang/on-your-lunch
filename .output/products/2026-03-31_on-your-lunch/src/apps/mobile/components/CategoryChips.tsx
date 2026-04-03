// ─────────────────────────────────────────
// 카테고리 칩 가로 스크롤
//
// 홈, 탐색 화면에서 공유하는 카테고리 필터 칩.
// 복수 선택 가능. 즐겨찾기 칩 옵션 지원.
// ─────────────────────────────────────────

import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/tokens';
import type { CategoryListItem } from '@on-your-lunch/shared-types';

interface CategoryChipsProps {
  /** 카테고리 목록 */
  categories: CategoryListItem[];
  /** 선택된 카테고리 ID 목록 */
  selectedIds: string[];
  /** 카테고리 탭 콜백 */
  onToggle: (id: string) => void;
  /** 즐겨찾기 칩 표시 여부 */
  showFavorite?: boolean;
  /** 즐겨찾기 활성 여부 */
  isFavoriteActive?: boolean;
  /** 즐겨찾기 탭 콜백 */
  onFavoriteToggle?: () => void;
}

export default function CategoryChips({
  categories,
  selectedIds,
  onToggle,
  showFavorite = false,
  isFavoriteActive = false,
  onFavoriteToggle,
}: CategoryChipsProps) {
  const isAllSelected = selectedIds.length === 0;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      {/* 전체 칩 */}
      <TouchableOpacity
        style={[styles.chip, isAllSelected && styles.chipActive]}
        onPress={() => onToggle('ALL')}
        activeOpacity={0.7}
      >
        <Text style={[styles.chipText, isAllSelected && styles.chipTextActive]}>
          전체
        </Text>
      </TouchableOpacity>

      {/* 카테고리 칩 */}
      {categories.map((cat) => {
        const isActive = selectedIds.includes(cat.id);
        return (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onToggle(cat.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* 즐겨찾기 칩 */}
      {showFavorite && onFavoriteToggle && (
        <TouchableOpacity
          style={[styles.chip, isFavoriteActive && styles.chipActive]}
          onPress={onFavoriteToggle}
          activeOpacity={0.7}
        >
          <View style={styles.favoriteChipContent}>
            <Text style={[styles.favoriteHeart, isFavoriteActive && styles.chipTextActive]}>
              {isFavoriteActive ? '♥' : '♡'}
            </Text>
            <Text style={[styles.chipText, isFavoriteActive && styles.chipTextActive]}>
              즐겨찾기
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.bg.tertiary,
    borderRadius: Radius.full,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    ...Typography.body2,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  chipTextActive: {
    color: Colors.text.inverse,
  },
  favoriteChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  favoriteHeart: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});
