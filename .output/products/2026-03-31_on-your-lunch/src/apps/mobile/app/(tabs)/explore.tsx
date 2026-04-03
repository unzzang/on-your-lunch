// ─────────────────────────────────────────
// 탐색 화면
//
// 검색 바 + 카테고리 칩 + 리스트 뷰(기본) / 지도 뷰 전환.
// 리스트는 무한 스크롤, 정렬(거리순/별점순).
// 4가지 상태: 정상 / 로딩 / 빈 / 에러.
// ─────────────────────────────────────────

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/tokens';
import { useExploreStore } from '@/stores/exploreStore';
import { useFilterStore } from '@/stores/filterStore';
import {
  useRestaurantList,
  useCategories,
  useFavoriteToggle,
} from '@/services/hooks';
import CategoryChips from '@/components/CategoryChips';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { PriceRange, RestaurantSort } from '@on-your-lunch/shared-types';
import type { RestaurantListItem, CategorySummary, MyVisitSummary } from '@on-your-lunch/shared-types';

function formatPriceRange(range: PriceRange | null): string {
  switch (range) {
    case PriceRange.UNDER_10K: return '~1만원';
    case PriceRange.BETWEEN_10K_20K: return '1~2만원';
    case PriceRange.OVER_20K: return '2만원~';
    default: return '';
  }
}

export default function ExploreScreen() {
  const router = useRouter();
  const { viewMode, toggleViewMode } = useExploreStore();
  const { categoryIds, toggleCategory, setCategoryIds, resetFilters } = useFilterStore();
  const [sort, setSort] = useState<RestaurantSort>(RestaurantSort.DISTANCE);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [searchText, setSearchText] = useState('');

  const { data: categories = [] } = useCategories();
  const favoriteMutation = useFavoriteToggle();

  const {
    data: listData,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRestaurantList({
    categoryId: categoryIds.length === 1 ? categoryIds[0] : undefined,
    sort,
  });

  const restaurants = listData?.pages.flatMap((page) => page.items) ?? [];

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

  const renderListItem = useCallback(
    ({ item }: { item: RestaurantListItem }) => {
      const priceText = formatPriceRange(item.priceRange);
      const metaParts = [item.category.name, `도보 ${item.walkMinutes}분`];
      if (priceText) metaParts.push(priceText);

      return (
        <TouchableOpacity
          style={[styles.listItem, item.isClosed && styles.listItemClosed]}
          onPress={() => handleRestaurantPress(item.id)}
          activeOpacity={0.7}
        >
          {/* 사진 */}
          <View style={styles.listPhoto}>
            {item.thumbnailUrl ? (
              <Image
                source={{ uri: item.thumbnailUrl }}
                style={styles.listPhotoImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.listPhotoPlaceholder, { backgroundColor: item.category.colorCode + '20' }]}>
                <Text style={styles.listPhotoIcon}>{'🍽'}</Text>
              </View>
            )}
          </View>

          {/* 정보 */}
          <View style={styles.listContent}>
            <View style={styles.listNameRow}>
              <Text style={styles.listName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.isClosed && (
                <View style={styles.closedBadge}>
                  <Text style={styles.closedText}>폐업</Text>
                </View>
              )}
            </View>
            <Text style={styles.listMeta}>{metaParts.join(' · ')}</Text>
            {item.myVisit && (
              <Text style={styles.listVisit}>
                <Text style={styles.star}>{'★'}</Text>{' '}
                {item.myVisit.rating.toFixed(1)} ({item.myVisit.visitCount}회)
              </Text>
            )}
          </View>

          {/* 하트 */}
          <TouchableOpacity
            style={styles.listHeart}
            onPress={() => handleFavoriteToggle(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={[
                styles.heartIcon,
                item.isFavorite && styles.heartIconActive,
              ]}
            >
              {item.isFavorite ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [handleRestaurantPress, handleFavoriteToggle],
  );

  const renderMapView = () => (
    <View style={styles.mapArea}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapIcon}>{'🗺'}</Text>
        <Text style={styles.mapText}>카카오맵 지도 영역</Text>
      </View>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.skeletonArea}>
          <SkeletonCard hasImage={false} imageHeight={0} />
          <SkeletonCard hasImage={false} imageHeight={0} />
          <SkeletonCard hasImage={false} imageHeight={0} />
          <SkeletonCard hasImage={false} imageHeight={0} />
        </View>
      );
    }

    if (isError) {
      return <ErrorState onRetry={() => refetch()} />;
    }

    if (restaurants.length === 0) {
      return favoriteOnly ? (
        <EmptyState
          icon="♡"
          title="즐겨찾기한 식당이 없어요"
          description="마음에 드는 식당에 하트를 눌러보세요"
        />
      ) : (
        <EmptyState
          icon="🍽"
          title="조건에 맞는 식당이 없어요"
          actionLabel="필터 초기화"
          onAction={resetFilters}
          actionVariant="secondary"
        />
      );
    }

    if (viewMode === 'map') {
      return renderMapView();
    }

    return (
      <FlatList
        data={restaurants}
        renderItem={renderListItem}
        keyExtractor={(item) => item.id}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.loadingMore}>
              <Text style={styles.loadingMoreText}>불러오는 중...</Text>
            </View>
          ) : null
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 검색 바 */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>{'🔍'}</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="식당명, 메뉴 검색"
            placeholderTextColor={Colors.text.placeholder}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* 카테고리 칩 */}
      <CategoryChips
        categories={categories}
        selectedIds={categoryIds}
        onToggle={handleCategoryToggle}
        showFavorite
        isFavoriteActive={favoriteOnly}
        onFavoriteToggle={() => setFavoriteOnly(!favoriteOnly)}
      />

      {/* 정렬 (리스트 뷰) */}
      {viewMode === 'list' && (
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() =>
              setSort(
                sort === RestaurantSort.DISTANCE
                  ? RestaurantSort.RATING
                  : RestaurantSort.DISTANCE,
              )
            }
            activeOpacity={0.7}
          >
            <Text style={styles.sortText}>
              {sort === RestaurantSort.DISTANCE ? '거리순' : '별점순'} ▼
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 메인 콘텐츠 */}
      <View style={styles.content}>{renderContent()}</View>

      {/* 뷰 전환 버튼 */}
      <TouchableOpacity
        style={[styles.viewToggle, Shadow.md]}
        onPress={toggleViewMode}
        activeOpacity={0.8}
      >
        <Text style={styles.viewToggleIcon}>
          {viewMode === 'map' ? '📋' : '🗺'}
        </Text>
        <Text style={styles.viewToggleText}>
          {viewMode === 'map' ? '목록' : '지도'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  searchBarContainer: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.tertiary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  searchIcon: {
    fontSize: 20,
  },
  searchInput: {
    flex: 1,
    ...Typography.body2,
    fontSize: 15,
    color: Colors.text.primary,
    padding: 0,
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  sortButton: {
    paddingVertical: Spacing.xs,
  },
  sortText: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  skeletonArea: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  // 리스트 아이템
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.default,
    gap: Spacing.md,
  },
  listItemClosed: {
    opacity: 0.5,
  },
  listPhoto: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  listPhotoImage: {
    width: '100%',
    height: '100%',
  },
  listPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg.tertiary,
  },
  listPhotoIcon: {
    fontSize: 32,
  },
  listContent: {
    flex: 1,
  },
  listNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  listName: {
    ...Typography.body1,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  closedBadge: {
    backgroundColor: Colors.bg.tertiary,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  closedText: {
    ...Typography.overline,
    color: Colors.text.placeholder,
  },
  listMeta: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 3,
  },
  listVisit: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 3,
  },
  star: {
    color: Colors.rating,
  },
  listHeart: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 24,
    color: Colors.text.placeholder,
  },
  heartIconActive: {
    color: Colors.primary,
  },
  // 지도 뷰
  mapArea: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: Colors.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  mapIcon: {
    fontSize: 48,
  },
  mapText: {
    ...Typography.body2,
    color: Colors.text.placeholder,
  },
  // 뷰 전환
  viewToggle: {
    position: 'absolute',
    bottom: Spacing.base,
    right: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.primary,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border.default,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    gap: 6,
    zIndex: 5,
  },
  viewToggleIcon: {
    fontSize: 18,
  },
  viewToggleText: {
    ...Typography.caption,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  loadingMore: {
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  loadingMoreText: {
    ...Typography.caption,
    color: Colors.text.placeholder,
  },
});
