import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing, radius, shadows } from '@/constants/tokens';

/** 스켈레톤 카드 — 로딩 중 shimmer 효과 */
export default function SkeletonCard() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.imageSkeleton, { opacity }]} />
      <View style={styles.info}>
        <Animated.View style={[styles.titleSkeleton, { opacity }]} />
        <Animated.View style={[styles.metaSkeleton, { opacity }]} />
      </View>
    </View>
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
  imageSkeleton: {
    height: 160,
    backgroundColor: colors.bg.tertiary,
  },
  info: {
    padding: spacing.base,
    gap: spacing.sm,
  },
  titleSkeleton: {
    height: 20,
    width: '60%',
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.sm,
  },
  metaSkeleton: {
    height: 14,
    width: '80%',
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.sm,
  },
});
