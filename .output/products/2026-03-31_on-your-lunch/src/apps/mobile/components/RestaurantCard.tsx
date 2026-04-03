// ─────────────────────────────────────────
// 식당 카드 컴포넌트
//
// 이미지 + 식당명 + 카테고리 + 도보시간 + 가격대 + 즐겨찾기 하트 + 방문 뱃지.
// 홈 추천 카드, 탐색 리스트에서 공용으로 사용.
// ─────────────────────────────────────────

import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/tokens';
import { PriceRange } from '@on-your-lunch/shared-types';
import type { CategorySummary, MyVisitSummary } from '@on-your-lunch/shared-types';

interface RestaurantCardProps {
  id: string;
  name: string;
  category: CategorySummary;
  walkMinutes: number;
  priceRange: PriceRange | null;
  thumbnailUrl: string | null;
  isFavorite: boolean;
  myVisit: MyVisitSummary | null;
  /** 카드 전체 탭 콜백 */
  onPress: (id: string) => void;
  /** 하트 탭 콜백 */
  onFavoriteToggle: (id: string) => void;
  /** 이미지 높이 (기본 160px) */
  imageHeight?: number;
}

function formatPriceRange(range: PriceRange | null): string {
  switch (range) {
    case PriceRange.UNDER_10K:
      return '~1만원';
    case PriceRange.BETWEEN_10K_20K:
      return '1~2만원';
    case PriceRange.OVER_20K:
      return '2만원~';
    default:
      return '';
  }
}

export default function RestaurantCard({
  id,
  name,
  category,
  walkMinutes,
  priceRange,
  thumbnailUrl,
  isFavorite,
  myVisit,
  onPress,
  onFavoriteToggle,
  imageHeight = 160,
}: RestaurantCardProps) {
  const priceText = formatPriceRange(priceRange);
  const metaParts = [category.name, `도보 ${walkMinutes}분`];
  if (priceText) metaParts.push(priceText);
  const metaText = metaParts.join(' · ');

  return (
    <TouchableOpacity
      style={[styles.card, Shadow.sm]}
      onPress={() => onPress(id)}
      activeOpacity={0.8}
    >
      {/* 이미지 영역 */}
      <View style={[styles.imageContainer, { height: imageHeight }]}>
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              { backgroundColor: category.colorCode + '20' },
            ]}
          >
            <Text style={styles.placeholderIcon}>{'🍽'}</Text>
          </View>
        )}
      </View>

      {/* 정보 영역 */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => onFavoriteToggle(id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={[
                styles.heart,
                isFavorite && styles.heartActive,
              ]}
            >
              {isFavorite ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.meta}>{metaText}</Text>

        {myVisit && (
          <View style={styles.visitBadge}>
            <Text style={styles.visitText}>
              {'★'} {myVisit.rating.toFixed(1)} · {myVisit.visitCount}번 방문
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.primary,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  imageContainer: {
    overflow: 'hidden',
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
  },
  info: {
    padding: Spacing.base,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  name: {
    ...Typography.h3,
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  heartButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heart: {
    fontSize: 24,
    color: Colors.text.placeholder,
  },
  heartActive: {
    color: Colors.primary,
  },
  meta: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  visitBadge: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.bg.tertiary,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
  },
  visitText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
});
