// ─────────────────────────────────────────
// 스켈레톤 카드
//
// 로딩 중 shimmer 애니메이션을 표시하는 플레이스홀더 카드.
// ─────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, Radius, Shadow } from '@/constants/tokens';

interface SkeletonCardProps {
  /** 이미지 영역을 포함할지 여부 */
  hasImage?: boolean;
  /** 이미지 높이 (기본 160px) */
  imageHeight?: number;
}

export default function SkeletonCard({
  hasImage = true,
  imageHeight = 160,
}: SkeletonCardProps) {
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
    <View style={[styles.card, Shadow.sm]}>
      {hasImage && (
        <Animated.View
          style={[styles.image, { height: imageHeight, opacity }]}
        />
      )}
      <View style={styles.info}>
        <Animated.View style={[styles.titleLine, { opacity }]} />
        <Animated.View style={[styles.metaLine, { opacity }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.primary,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  image: {
    backgroundColor: Colors.bg.tertiary,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  info: {
    padding: Spacing.base,
  },
  titleLine: {
    height: 18,
    width: '60%',
    backgroundColor: Colors.bg.tertiary,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },
  metaLine: {
    height: 14,
    width: '80%',
    backgroundColor: Colors.bg.tertiary,
    borderRadius: Radius.sm,
  },
});
