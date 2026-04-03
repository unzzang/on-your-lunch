// ─────────────────────────────────────────
// 홈 화면 (오늘의 추천)
//
// App Bar + 인사 영역 + 카테고리 칩 + 서브 필터 + 추천 카드 3장 + 새로고침 버튼.
// 4가지 상태: 정상 / 로딩(스켈레톤) / 빈 / 에러.
// ─────────────────────────────────────────

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/tokens';
import { useFilterStore } from '@/stores/filterStore';
import { useRecommendations, useRefreshRecommendations } from '@/services/hooks';
import { useCategories, useFavoriteToggle, useMe } from '@/services/hooks';
import RestaurantCard from '@/components/RestaurantCard';
import CategoryChips from '@/components/CategoryChips';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import type { WalkMinutes } from '@on-your-lunch/shared-types';
import { PriceRange } from '@on-your-lunch/shared-types';

const WALK_OPTIONS: { label: string; value: WalkMinutes }[] = [
  { label: '5분', value: 5 },
  { label: '10분', value: 10 },
  { label: '15분', value: 15 },
];

const PRICE_OPTIONS: { label: string; value: PriceRange }[] = [
  { label: '~1만', value: PriceRange.UNDER_10K },
  { label: '1~2만', value: PriceRange.BETWEEN_10K_20K },
  { label: '2만~', value: PriceRange.OVER_20K },
];

export default function HomeScreen() {
  const router = useRouter();
  const { categoryIds, priceRange, walkMinutes, toggleCategory, setCategoryIds, setPriceRange, setWalkMinutes, resetFilters } = useFilterStore();

  const { data: meData } = useMe();
  const { data: categories = [] } = useCategories();
  const {
    data: recommendData,
    isLoading,
    isError,
    refetch,
  } = useRecommendations();
  const refreshMutation = useRefreshRecommendations();
  const favoriteMutation = useFavoriteToggle();

  const [refreshing, setRefreshing] = useState(false);

  const nickname = meData?.nickname ?? '사용자';
  const restaurants = recommendData?.restaurants ?? [];
  const refreshCount = recommendData?.refreshCount ?? 0;
  const maxRefresh = recommendData?.maxRefreshCount ?? 5;

  const onPullRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleRefresh = useCallback(() => {
    if (refreshCount >= maxRefresh) return;
    refreshMutation.mutate({
      categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
      priceRange: priceRange ?? undefined,
      walkMinutes,
    });
  }, [refreshCount, maxRefresh, refreshMutation, categoryIds, priceRange, walkMinutes]);

  const handleCategoryToggle = useCallback(
    (id: string) => {
      if (id === 'ALL') {
        setCategoryIds([]);
      } else {
        toggleCategory(id);
      }
    },
    [setCategoryIds, toggleCategory],
  );

  const handleRestaurantPress = useCallback(
    (id: string) => {
      router.push(`/restaurant/${id}`);
    },
    [router],
  );

  const handleFavoriteToggle = useCallback(
    (id: string) => {
      favoriteMutation.mutate(id);
    },
    [favoriteMutation],
  );

  // 렌더 콘텐츠: 로딩 / 에러 / 빈 / 정상
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.cardArea}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      );
    }

    if (isError) {
      return <ErrorState onRetry={() => refetch()} />;
    }

    if (restaurants.length === 0) {
      return (
        <EmptyState
          icon="🍽"
          title="조건에 맞는 식당을 찾지 못했어요"
          description="필터를 바꿔보세요"
          actionLabel="필터 초기화"
          onAction={resetFilters}
          actionVariant="secondary"
        />
      );
    }

    return (
      <View style={styles.cardArea}>
        {restaurants.map((r) => (
          <RestaurantCard
            key={r.id}
            id={r.id}
            name={r.name}
            category={r.category}
            walkMinutes={r.walkMinutes}
            priceRange={r.priceRange}
            thumbnailUrl={r.thumbnailUrl}
            isFavorite={r.isFavorite}
            myVisit={r.myVisit}
            onPress={handleRestaurantPress}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ))}

        {/* 새로고침 버튼 */}
        <TouchableOpacity
          style={[
            styles.refreshButton,
            refreshCount >= maxRefresh && styles.refreshButtonDisabled,
          ]}
          onPress={handleRefresh}
          disabled={refreshCount >= maxRefresh || refreshMutation.isPending}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.refreshIcon,
              refreshCount >= maxRefresh && styles.refreshIconDisabled,
            ]}
          >
            {'🔄'}
          </Text>
          <Text
            style={[
              styles.refreshText,
              refreshCount >= maxRefresh && styles.refreshTextDisabled,
            ]}
          >
            다른 추천 보기 ({refreshCount}/{maxRefresh})
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.logo}>온유어런치</Text>
        <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
          <Text style={styles.bellIcon}>{'🔔'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onPullRefresh} />
        }
      >
        {/* 인사 영역 */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>{nickname}님,</Text>
          <Text style={styles.greetingText}>오늘 점심 뭐 먹을까요?</Text>
        </View>

        {/* 카테고리 칩 */}
        <CategoryChips
          categories={categories}
          selectedIds={categoryIds}
          onToggle={handleCategoryToggle}
        />

        {/* 서브 필터 */}
        <View style={styles.subFilters}>
          {/* 도보 거리 */}
          <View style={styles.segmentGroup}>
            {WALK_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.segment,
                  walkMinutes === opt.value && styles.segmentActive,
                ]}
                onPress={() => setWalkMinutes(opt.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentText,
                    walkMinutes === opt.value && styles.segmentTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 가격대 */}
          <View style={styles.segmentGroup}>
            {PRICE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.segment,
                  priceRange === opt.value && styles.segmentActive,
                ]}
                onPress={() =>
                  setPriceRange(priceRange === opt.value ? null : opt.value)
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentText,
                    priceRange === opt.value && styles.segmentTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 메인 콘텐츠 */}
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  appBar: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  logo: {
    ...Typography.h2,
    color: Colors.primary,
  },
  bellButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['2xl'],
  },
  greeting: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  greetingText: {
    ...Typography.h1,
    color: Colors.text.primary,
  },
  subFilters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  segmentGroup: {
    flexDirection: 'row',
    backgroundColor: Colors.bg.tertiary,
    borderRadius: Radius.md,
    padding: 2,
  },
  segment: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  segmentActive: {
    backgroundColor: Colors.bg.primary,
    ...Shadow.sm,
  },
  segmentText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  segmentTextActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.default,
    marginTop: Spacing.md,
  },
  cardArea: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: Colors.bg.secondary,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.default,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  refreshButtonDisabled: {
    backgroundColor: Colors.bg.tertiary,
  },
  refreshIcon: {
    fontSize: 20,
  },
  refreshIconDisabled: {
    opacity: 0.4,
  },
  refreshText: {
    ...Typography.body2,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  refreshTextDisabled: {
    color: Colors.text.placeholder,
  },
});
