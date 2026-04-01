import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  MagnifyingGlass,
  MapTrifold,
  List as ListIcon,
  Heart,
  BowlFood,
  CaretDown,
  Star,
  ForkKnife,
} from 'phosphor-react-native';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '@/constants/tokens';
import { useExploreStore } from '@/stores/exploreStore';
import { useFilterStore } from '@/stores/filterStore';
import { useRestaurantList, useCategories, useToggleFavorite } from '@/services/hooks';
import { RestaurantSort, PriceRange } from '@on-your-lunch/shared-types';
import type { RestaurantListItem } from '@on-your-lunch/shared-types';
import CategoryChips from '@/components/CategoryChips';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

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

/** 탐색 화면 -- 리스트/지도 뷰 전환 */
export default function ExploreScreen() {
  const router = useRouter();
  const { viewMode, toggleViewMode } = useExploreStore();
  const { priceRange, walkMinutes } = useFilterStore();
  const { data: categories = [] } = useCategories();
  const toggleFavoriteMutation = useToggleFavorite();

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isFavoriteFilter, setIsFavoriteFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<RestaurantSort>(RestaurantSort.DISTANCE);
  const [page, setPage] = useState(1);

  const {
    data: listData,
    isLoading,
    isError,
    refetch,
  } = useRestaurantList({
    categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
    priceRange: priceRange ?? undefined,
    walkMinutes,
    sort,
    page,
    limit: 20,
  });

  const handleCategoryToggle = (id: string) => {
    if (id === '__all__') {
      setSelectedCategoryIds([]);
    } else {
      setSelectedCategoryIds((prev) =>
        prev.includes(id)
          ? prev.filter((cid) => cid !== id)
          : [...prev, id],
      );
    }
  };

  const handleToggleSort = () => {
    setSort((prev) =>
      prev === RestaurantSort.DISTANCE
        ? RestaurantSort.RATING
        : RestaurantSort.DISTANCE,
    );
  };

  const renderListItem = useCallback(
    ({ item }: { item: RestaurantListItem }) => {
      const priceLabel = formatPriceRange(item.priceRange);
      const meta = [
        item.category.name,
        `도보 ${item.walkMinutes}분`,
        priceLabel,
      ]
        .filter(Boolean)
        .join(' \u00B7 ');

      return (
        <Pressable
          style={styles.listItem}
          onPress={() => router.push(`/restaurant/${item.id}`)}
        >
          {/* Photo */}
          <View style={styles.listItemPhoto}>
            {item.thumbnailUrl ? (
              <Image
                source={{ uri: item.thumbnailUrl }}
                style={styles.listItemImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.listItemImagePlaceholder}>
                <ForkKnife
                  size={24}
                  color={item.category.colorCode || colors.text.placeholder}
                  weight="light"
                />
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.listItemContent}>
            <Text style={styles.listItemName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.listItemMeta} numberOfLines={1}>
              {meta}
            </Text>
            {item.myVisit && (
              <View style={styles.ratingRow}>
                <Star size={12} color={colors.rating} weight="fill" />
                <Text style={styles.listItemMeta}>
                  {' '}
                  {item.myVisit.rating.toFixed(1)} ({item.myVisit.visitCount}회)
                </Text>
              </View>
            )}
          </View>

          {/* Heart */}
          <Pressable
            onPress={() =>
              toggleFavoriteMutation.mutate({
                restaurantId: item.id,
              })
            }
            hitSlop={10}
            style={styles.heartButton}
          >
            <Heart
              size={24}
              color={
                item.isFavorite ? colors.primary : colors.text.placeholder
              }
              weight={item.isFavorite ? 'fill' : 'regular'}
            />
          </Pressable>
        </Pressable>
      );
    },
    [router, toggleFavoriteMutation],
  );

  const renderSkeleton = () => (
    <View>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.listItem}>
          <Animated.View style={styles.skeletonPhoto} />
          <View style={styles.listItemContent}>
            <Animated.View style={styles.skeletonTitle} />
            <Animated.View style={styles.skeletonMeta} />
            <Animated.View style={styles.skeletonMeta2} />
          </View>
        </View>
      ))}
    </View>
  );

  const restaurants = listData?.items ?? [];
  const isEmpty = !isLoading && !isError && restaurants.length === 0;
  const isFavEmpty = isEmpty && isFavoriteFilter;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <MagnifyingGlass
            size={20}
            color={colors.text.placeholder}
            weight="regular"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="식당명, 메뉴 검색"
            placeholderTextColor={colors.text.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Chips */}
      <CategoryChips
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        selectedIds={selectedCategoryIds}
        onToggle={handleCategoryToggle}
        showFavorite
        isFavoriteActive={isFavoriteFilter}
        onFavoriteToggle={() => setIsFavoriteFilter((p) => !p)}
      />

      {/* List View */}
      {viewMode === 'list' ? (
        <>
          {/* Sort Row */}
          <View style={styles.sortRow}>
            <Pressable style={styles.sortButton} onPress={handleToggleSort}>
              <Text style={styles.sortText}>
                {sort === RestaurantSort.DISTANCE ? '거리순' : '별점순'}
              </Text>
              <CaretDown size={16} color={colors.text.secondary} />
            </Pressable>
          </View>

          {isLoading ? (
            renderSkeleton()
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : isFavEmpty ? (
            <EmptyState
              icon={
                <Heart
                  size={48}
                  color={colors.text.placeholder}
                  weight="light"
                />
              }
              title="즐겨찾기한 식당이 없어요"
              subtitle="마음에 드는 식당에 하트를 눌러보세요"
            />
          ) : isEmpty ? (
            <EmptyState
              icon={
                <BowlFood
                  size={48}
                  color={colors.text.placeholder}
                  weight="light"
                />
              }
              title="조건에 맞는 식당이 없어요"
              actionLabel="필터 초기화"
              onAction={() => {
                setSelectedCategoryIds([]);
                setIsFavoriteFilter(false);
              }}
              actionVariant="secondary"
            />
          ) : (
            <FlatList
              data={restaurants}
              renderItem={renderListItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              onEndReached={() => {
                if (listData?.meta.hasNext) {
                  setPage((p) => p + 1);
                }
              }}
              onEndReachedThreshold={0.5}
            />
          )}
        </>
      ) : (
        /* Map View Placeholder */
        <View style={styles.mapPlaceholder}>
          <MapTrifold size={48} color={colors.text.placeholder} weight="light" />
          <Text style={styles.mapPlaceholderText}>
            카카오맵 지도 영역
          </Text>
        </View>
      )}

      {/* View Toggle FAB */}
      <Pressable style={styles.viewToggle} onPress={toggleViewMode}>
        {viewMode === 'list' ? (
          <MapTrifold size={18} color={colors.text.primary} weight="regular" />
        ) : (
          <ListIcon size={18} color={colors.text.primary} weight="regular" />
        )}
        <Text style={styles.viewToggleText}>
          {viewMode === 'list' ? '지도' : '목록'}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  searchBarContainer: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: typography.body2.weight,
    color: colors.text.primary,
    padding: 0,
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  listItem: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    alignItems: 'center',
    gap: spacing.md,
  },
  listItemPhoto: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  listItemImage: {
    width: '100%',
    height: '100%',
  },
  listItemImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemContent: {
    flex: 1,
    gap: 3,
  },
  listItemName: {
    fontSize: typography.body1.size,
    fontWeight: '600',
    lineHeight: typography.body1.lineHeight,
    color: colors.text.primary,
  },
  listItemMeta: {
    fontSize: 13,
    color: colors.text.secondary,
    fontVariant: ['tabular-nums'],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg.tertiary,
  },
  mapPlaceholderText: {
    fontSize: typography.body2.size,
    color: colors.text.placeholder,
    marginTop: spacing.sm,
  },
  viewToggle: {
    position: 'absolute',
    bottom: spacing.base,
    right: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.full,
    paddingVertical: 10,
    paddingHorizontal: spacing.base,
    gap: 6,
    ...shadows.md,
    zIndex: 5,
  },
  viewToggleText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.primary,
  },
  skeletonPhoto: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.bg.tertiary,
  },
  skeletonTitle: {
    height: 16,
    width: '50%',
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.sm,
  },
  skeletonMeta: {
    height: 13,
    width: '70%',
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.sm,
    marginTop: 4,
  },
  skeletonMeta2: {
    height: 13,
    width: '40%',
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.sm,
    marginTop: 4,
  },
});
