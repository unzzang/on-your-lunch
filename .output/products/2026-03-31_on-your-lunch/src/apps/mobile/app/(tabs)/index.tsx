import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell, ArrowsClockwise, BowlFood } from 'phosphor-react-native';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '@/constants/tokens';
import { useAuthStore } from '@/stores/authStore';
import { useFilterStore } from '@/stores/filterStore';
import {
  useRecommendations,
  useRefreshRecommendations,
  useCategories,
  useToggleFavorite,
} from '@/services/hooks';
import { PriceRange, WALK_MINUTES_OPTIONS } from '@on-your-lunch/shared-types';
import type { WalkMinutes } from '@on-your-lunch/shared-types';
import RestaurantCard from '@/components/RestaurantCard';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import CategoryChips from '@/components/CategoryChips';

const PRICE_OPTIONS = [
  { key: PriceRange.UNDER_10K, label: '~1만' },
  { key: PriceRange.BETWEEN_10K_20K, label: '1~2만' },
  { key: PriceRange.OVER_20K, label: '2만~' },
];

const WALK_OPTIONS = WALK_MINUTES_OPTIONS.map((m) => ({
  key: m,
  label: `${m}분`,
}));

/** 홈 화면 -- 오늘의 추천 카드 3장 */
export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const {
    categoryIds,
    priceRange,
    walkMinutes,
    toggleCategory,
    setCategoryIds,
    setPriceRange,
    setWalkMinutes,
    resetFilters,
  } = useFilterStore();

  const {
    data: recData,
    isLoading,
    isError,
    refetch,
  } = useRecommendations();

  const refreshMutation = useRefreshRecommendations();
  const toggleFavoriteMutation = useToggleFavorite();
  const { data: categories = [] } = useCategories();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefreshPull = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleRefreshButton = () => {
    if (
      recData &&
      recData.refreshCount >= recData.maxRefreshCount
    ) {
      return;
    }
    refreshMutation.mutate({
      categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
      priceRange: priceRange ?? undefined,
      walkMinutes,
    });
  };

  const handleCategoryToggle = (id: string) => {
    if (id === '__all__') {
      setCategoryIds([]);
    } else {
      toggleCategory(id);
    }
  };

  const handleNotification = () => {
    Alert.alert('준비 중이에요', '알림 기능은 곧 출시됩니다.');
  };

  const refreshExhausted =
    recData != null &&
    recData.refreshCount >= recData.maxRefreshCount;

  const nickname = user?.nickname ?? '사용자';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefreshPull} />
        }
      >
        {/* App Bar */}
        <View style={styles.appBar}>
          <Text style={styles.logoText}>온유어런치</Text>
          <Pressable
            onPress={handleNotification}
            hitSlop={10}
            style={styles.bellButton}
          >
            <Bell size={24} color={colors.text.secondary} weight="regular" />
          </Pressable>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingName}>{nickname}님,</Text>
          <Text style={styles.greetingQuestion}>
            오늘 점심 뭐 먹을까요?
          </Text>
        </View>

        {/* Filter: Category Chips */}
        <CategoryChips
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          selectedIds={categoryIds}
          onToggle={handleCategoryToggle}
        />

        {/* Filter: Sub Filters */}
        <View style={styles.subFilterRow}>
          <View style={styles.segmentGroup}>
            {WALK_OPTIONS.map((opt) => {
              const active = walkMinutes === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={[
                    styles.segment,
                    active && styles.segmentActive,
                  ]}
                  onPress={() => setWalkMinutes(opt.key as WalkMinutes)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      active && styles.segmentTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.segmentGroup}>
            {PRICE_OPTIONS.map((opt) => {
              const active = priceRange === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={[
                    styles.segment,
                    active && styles.segmentActive,
                  ]}
                  onPress={() =>
                    setPriceRange(active ? null : opt.key)
                  }
                >
                  <Text
                    style={[
                      styles.segmentText,
                      active && styles.segmentTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Content */}
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !recData || recData.restaurants.length === 0 ? (
          <EmptyState
            icon={
              <BowlFood
                size={48}
                color={colors.text.placeholder}
                weight="light"
              />
            }
            title="조건에 맞는 식당을 찾지 못했어요"
            subtitle="필터를 바꿔보세요"
            actionLabel="필터 초기화"
            onAction={resetFilters}
            actionVariant="secondary"
          />
        ) : (
          <>
            {recData.restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() =>
                  router.push(`/restaurant/${restaurant.id}`)
                }
                onToggleFavorite={() =>
                  toggleFavoriteMutation.mutate({
                    restaurantId: restaurant.id,
                  })
                }
              />
            ))}

            {/* Refresh Button */}
            <Pressable
              style={[
                styles.refreshButton,
                refreshExhausted && styles.refreshButtonDisabled,
              ]}
              onPress={handleRefreshButton}
              disabled={refreshExhausted || refreshMutation.isPending}
            >
              <ArrowsClockwise
                size={20}
                color={
                  refreshExhausted
                    ? colors.text.placeholder
                    : colors.primary
                }
                weight="regular"
              />
              <Text
                style={[
                  styles.refreshText,
                  refreshExhausted && styles.refreshTextDisabled,
                ]}
              >
                다른 추천 보기 ({recData.refreshCount}/
                {recData.maxRefreshCount})
              </Text>
            </Pressable>
          </>
        )}

        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  appBar: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  logoText: {
    fontSize: typography.h2.size,
    fontWeight: typography.h2.weight,
    color: colors.primary,
  },
  bellButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  greetingName: {
    fontSize: typography.h1.size,
    fontWeight: typography.h1.weight,
    lineHeight: typography.h1.lineHeight,
    color: colors.text.primary,
  },
  greetingQuestion: {
    fontSize: typography.h1.size,
    fontWeight: typography.h1.weight,
    lineHeight: typography.h1.lineHeight,
    color: colors.text.primary,
  },
  subFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  segmentGroup: {
    flexDirection: 'row',
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.md,
    padding: 2,
  },
  segment: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  segmentActive: {
    backgroundColor: colors.bg.primary,
    ...shadows.sm,
  },
  segmentText: {
    fontSize: typography.caption.size,
    fontWeight: typography.caption.weight,
    color: colors.text.secondary,
  },
  segmentTextActive: {
    fontWeight: '500',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginBottom: spacing.base,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    marginHorizontal: spacing.base,
    gap: spacing.sm,
  },
  refreshButtonDisabled: {
    backgroundColor: colors.bg.tertiary,
  },
  refreshText: {
    fontSize: typography.body2.size,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  refreshTextDisabled: {
    color: colors.text.placeholder,
  },
});
