import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Heart } from 'phosphor-react-native';
import { colors, typography, spacing, radius } from '@/constants/tokens';

interface CategoryChipsProps {
  categories: Array<{ id: string; name: string }>;
  selectedIds: string[];
  onToggle: (id: string) => void;
  showFavorite?: boolean;
  isFavoriteActive?: boolean;
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
  const allItems = [{ id: '__all__', name: '전체' }, ...categories];
  const isAllSelected = selectedIds.length === 0;

  const handlePress = (id: string) => {
    if (id === '__all__') {
      // "전체" 선택 시 모든 필터 해제
      if (!isAllSelected) {
        onToggle('__all__');
      }
    } else {
      onToggle(id);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {allItems.map((cat) => {
        const isActive =
          cat.id === '__all__' ? isAllSelected : selectedIds.includes(cat.id);
        return (
          <Pressable
            key={cat.id}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => handlePress(cat.id)}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {cat.name}
            </Text>
          </Pressable>
        );
      })}

      {showFavorite && (
        <Pressable
          style={[styles.chip, isFavoriteActive && styles.chipActive]}
          onPress={onFavoriteToggle}
        >
          <Heart
            size={16}
            color={isFavoriteActive ? colors.text.inverse : colors.text.secondary}
            weight={isFavoriteActive ? 'fill' : 'regular'}
            style={{ marginRight: spacing.xs }}
          />
          <Text
            style={[
              styles.chipText,
              isFavoriteActive && styles.chipTextActive,
            ]}
          >
            즐겨찾기
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: typography.body2.size,
    fontWeight: '500',
    lineHeight: typography.body2.lineHeight,
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.text.inverse,
  },
});
