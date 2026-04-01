import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Animated,
} from 'react-native';
import { Heart, ForkKnife, Star } from 'phosphor-react-native';
import { colors, typography, spacing, radius, shadows } from '@/constants/tokens';
import type { RestaurantListItem } from '@on-your-lunch/shared-types';
import { PriceRange } from '@on-your-lunch/shared-types';

interface RestaurantCardProps {
  restaurant: RestaurantListItem;
  onPress: () => void;
  onToggleFavorite: () => void;
}

function formatPriceRange(pr: PriceRange | null): string {
  switch (pr) {
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
  restaurant,
  onPress,
  onToggleFavorite,
}: RestaurantCardProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleFavoritePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onToggleFavorite();
  };

  const priceLabel = formatPriceRange(restaurant.priceRange);
  const meta = [
    restaurant.category.name,
    `도보 ${restaurant.walkMinutes}분`,
    priceLabel,
  ]
    .filter(Boolean)
    .join(' \u00B7 ');

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* Image */}
      <View style={styles.imageContainer}>
        {restaurant.thumbnailUrl ? (
          <Image
            source={{ uri: restaurant.thumbnailUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              {
                backgroundColor:
                  restaurant.category.colorCode ? restaurant.category.colorCode + '20' : colors.bg.tertiary,
              },
            ]}
          >
            <ForkKnife
              size={48}
              color={restaurant.category.colorCode || colors.text.placeholder}
              weight="light"
            />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              handleFavoritePress();
            }}
            hitSlop={10}
            style={styles.heartButton}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Heart
                size={24}
                color={
                  restaurant.isFavorite
                    ? colors.primary
                    : colors.text.placeholder
                }
                weight={restaurant.isFavorite ? 'fill' : 'regular'}
              />
            </Animated.View>
          </Pressable>
        </View>

        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>

        {restaurant.myVisit && (
          <View style={styles.visitBadge}>
            <Star size={12} color={colors.rating} weight="fill" />
            <Text style={styles.visitText}>
              {' '}
              {restaurant.myVisit.rating.toFixed(1)} \u00B7{' '}
              {restaurant.myVisit.visitCount}번 방문
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.primary,
    borderRadius: radius.lg,
    ...shadows.sm,
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 160,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    overflow: 'hidden',
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
    backgroundColor: colors.bg.tertiary,
  },
  info: {
    padding: spacing.base,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    fontSize: typography.h3.size,
    fontWeight: typography.h3.weight,
    lineHeight: typography.h3.lineHeight,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  heartButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meta: {
    fontSize: typography.body2.size,
    fontWeight: typography.body2.weight,
    lineHeight: typography.body2.lineHeight,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    fontVariant: ['tabular-nums'],
  },
  visitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  visitText: {
    fontSize: typography.caption.size,
    fontWeight: typography.caption.weight,
    lineHeight: typography.caption.lineHeight,
    color: colors.text.secondary,
  },
});
