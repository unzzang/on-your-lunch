import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typo, spacing, radius, shadow } from '../../../constants/tokens';
import { useRecommendations, useRefreshRecommendation } from '../../../services/hooks';
import { useAuthStore } from '../../../stores/authStore';
import ErrorState from '../../../components/ErrorState';
import EmptyState from '../../../components/EmptyState';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const CATEGORIES = [
  { id: 'all', name: '전체' },
  { id: 'korean', name: '한식' },
  { id: 'chinese', name: '중식' },
  { id: 'japanese', name: '일식' },
  { id: 'western', name: '양식' },
  { id: 'asian', name: '아시안' },
  { id: 'snack', name: '분식' },
  { id: 'salad', name: '샐러드' },
];

type CategoryItem = (typeof CATEGORIES)[number];

function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardImageSkeleton} />
      <View style={styles.cardInfo}>
        <View style={styles.skeletonLine1} />
        <View style={styles.skeletonLine2} />
      </View>
    </View>
  );
}

export default function HomeTab() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { isAuthenticated, setTokens, setUser } = useAuthStore();
  const { data, isLoading, isError, refetch } = useRecommendations();
  const refreshMutation = useRefreshRecommendation();

  // 토큰 없을 때 dev-login 재시도 후 refetch
  const handleRetry = async () => {
    if (!isAuthenticated && __DEV__) {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/auth/dev-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const json = await response.json();
          const result = json.data;
          setTokens(result.accessToken, result.refreshToken);
          if (result.user) {
            setUser(result.user.id, result.user.nickname ?? null, result.user.isOnboardingCompleted ?? false);
          }
        }
      } catch (e) {
        // dev-login 실패 시 그냥 refetch
      }
    }
    refetch();
  };

  const restaurants = data?.restaurants ?? [];
  const refreshCount = data?.refreshCount ?? 0;
  const maxRefresh = data?.maxRefreshCount ?? 5;

  const handleRefresh = () => {
    refreshMutation.mutate({});
  };

  const renderHeader = useCallback(() => (
    <>
      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>사용자님,</Text>
        <Text style={styles.greetingText}>오늘 점심 뭐 먹을까요?</Text>
      </View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
        style={styles.chipScroll}
        nestedScrollEnabled
      >
        {CATEGORIES.map((cat: CategoryItem) => {
          const isActive = cat.id === selectedCategory;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sub Filters */}
      <View style={styles.subFilterRow}>
        <View style={styles.segmentGroup}>
          {['5분', '10분', '15분'].map((label, i) => {
            const isActive = i === 1;
            return (
              <TouchableOpacity
                key={label}
                style={[
                  styles.segment,
                  isActive && styles.segmentActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    isActive && styles.segmentTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.segmentGroup}>
          {['~1만', '1~2만', '2만~'].map((label, i) => {
            const isActive = i === 0;
            return (
              <TouchableOpacity
                key={label}
                style={[
                  styles.segment,
                  isActive && styles.segmentActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    isActive && styles.segmentTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />
    </>
  ), [selectedCategory]);

  const renderRestaurantCard = useCallback(({ item: restaurant }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/(tabs)/home/restaurant/${restaurant.id ?? restaurant.restaurantId}`)}
    >
      {/* Image Placeholder */}
      <View style={styles.cardImage}>
        <Ionicons name="restaurant-outline" size={48} color={colors.text.placeholder} />
      </View>
      {/* Info */}
      <View style={styles.cardInfo}>
        <View style={styles.cardRow}>
          <Text style={styles.cardName}>{restaurant.name}</Text>
          <TouchableOpacity style={styles.heartButton}>
            <Ionicons
              name={restaurant.isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={restaurant.isFavorite ? colors.primary : colors.text.placeholder}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardMeta}>
          {restaurant.categoryName ?? restaurant.category?.name ?? ''} · 도보 {restaurant.walkMinutes}분
        </Text>
      </View>
    </TouchableOpacity>
  ), [router]);

  const renderFooter = useCallback(() => {
    if (isLoading || isError || restaurants.length === 0) return null;
    return (
      <View>
        <TouchableOpacity
          style={styles.refreshButton}
          activeOpacity={0.7}
          onPress={handleRefresh}
          disabled={refreshCount >= maxRefresh || refreshMutation.isPending}
        >
          {refreshMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="refresh-outline" size={20} color={colors.primary} />
          )}
          <Text style={styles.refreshText}>
            다른 추천 보기 ({refreshCount}/{maxRefresh})
          </Text>
        </TouchableOpacity>
        <View style={{ height: spacing.lg }} />
      </View>
    );
  }, [refreshCount, maxRefresh, refreshMutation.isPending, isLoading, isError, restaurants.length, handleRefresh]);

  // 로딩/에러/빈 상태일 때 표시할 컨텐츠
  const renderStateContent = () => {
    if (isLoading) {
      return (
        <View>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      );
    }
    if (isError) {
      return (
        <ErrorState
          message="추천을 불러올 수 없어요"
          onRetry={handleRetry}
        />
      );
    }
    if (restaurants.length === 0) {
      return (
        <EmptyState
          icon="restaurant-outline"
          title="추천 식당이 없어요"
          subtitle="위치와 취향을 설정하면 맞춤 추천을 받을 수 있어요"
        />
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.logo}>온유어런치</Text>
        <TouchableOpacity style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={!isLoading && !isError ? restaurants : []}
        keyExtractor={(item: any) => String(item.id ?? item.restaurantId)}
        renderItem={renderRestaurantCard}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderStateContent()}
          </>
        }
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },

  // App Bar
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg.primary,
  },
  logo: {
    ...typo.h2,
    color: colors.primary,
  },
  bellButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List
  listContent: {
    flexGrow: 1,
  },

  // Greeting
  greeting: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  greetingText: {
    ...typo.h1,
    color: colors.text.primary,
  },

  // Category Chips
  chipScroll: {
    flexGrow: 0,
  },
  chipContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipInactive: {
    backgroundColor: colors.bg.tertiary,
  },
  chipText: {
    ...typo.body2,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.text.inverse,
  },
  chipTextInactive: {
    color: colors.text.secondary,
  },

  // Sub Filters
  subFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  segmentGroup: {
    flexDirection: 'row',
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.md,
    padding: 2,
  },
  segment: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  segmentActive: {
    backgroundColor: colors.bg.primary,
    ...shadow.sm,
  },
  segmentText: {
    ...typo.caption,
    color: colors.text.secondary,
  },
  segmentTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
  },

  // Skeleton
  cardImageSkeleton: {
    height: 160,
    backgroundColor: colors.bg.tertiary,
  },
  skeletonLine1: {
    height: 20,
    width: '50%',
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.sm,
  },
  skeletonLine2: {
    height: 14,
    width: '70%',
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },

  // Cards
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.primary,
    ...shadow.sm,
    overflow: 'hidden',
  },
  cardImage: {
    height: 160,
    backgroundColor: colors.bg.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    padding: spacing.lg,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    ...typo.h3,
    color: colors.text.primary,
    flex: 1,
  },
  heartButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMeta: {
    ...typo.body2,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  // Refresh
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.sm,
  },
  refreshText: {
    ...typo.body2,
    fontWeight: '500',
    color: colors.text.secondary,
  },
});
