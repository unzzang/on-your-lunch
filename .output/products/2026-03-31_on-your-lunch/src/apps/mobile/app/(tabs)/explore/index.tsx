import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typo, spacing, radius } from '../../../constants/tokens';
import ErrorState from '../../../components/ErrorState';
import EmptyState from '../../../components/EmptyState';
import { useRestaurants, useCategories, useFavoriteToggle } from '../../../services/hooks';
import { useExploreStore } from '../../../stores/exploreStore';
import { PriceRange } from '@on-your-lunch/shared-types';

function priceRangeLabel(range: PriceRange | null): string {
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

export default function ExploreTab() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { selectedCategoryId, setCategory } = useExploreStore();

  const { data: categories } = useCategories();
  const { data: restaurantData, isLoading, isError, refetch } = useRestaurants();
  const favoriteMutation = useFavoriteToggle();

  const restaurants = restaurantData?.items ?? [];

  const handleRetry = () => {
    refetch();
  };

  const handleToggleFavorite = (restaurantId: string) => {
    favoriteMutation.mutate(restaurantId);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={colors.text.placeholder} />
        <TextInput
          style={styles.searchInput}
          placeholder="식당명, 메뉴 검색"
          placeholderTextColor={colors.text.placeholder}
        />
      </View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
        style={styles.chipScroll}
      >
        <TouchableOpacity
          style={[styles.chip, !selectedCategoryId ? styles.chipActive : styles.chipInactive]}
          onPress={() => setCategory(null)}
        >
          <Text style={[styles.chipText, !selectedCategoryId ? styles.chipTextActive : styles.chipTextInactive]}>
            전체
          </Text>
        </TouchableOpacity>
        {(categories ?? []).map((cat) => {
          const isActive = cat.id === selectedCategoryId;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
              onPress={() => setCategory(isActive ? null : cat.id)}
            >
              <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sort */}
      <View style={styles.sortRow}>
        <Text style={styles.sortText}>거리순</Text>
        <Ionicons name="chevron-down-outline" size={14} color={colors.text.secondary} />
      </View>

      {/* 로딩 상태 */}
      {isLoading && (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>식당을 불러오는 중...</Text>
        </View>
      )}

      {/* 에러 상태 */}
      {isError && (
        <ErrorState
          message="식당 목록을 불러올 수 없어요"
          onRetry={handleRetry}
        />
      )}

      {/* 정상 상태: Restaurant List */}
      {!isLoading && !isError && (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="검색 결과가 없어요"
              subtitle="다른 키워드나 카테고리로 검색해보세요"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              activeOpacity={0.7}
              onPress={() => router.push(`/(tabs)/explore/restaurant/${item.id}`)}
            >
              <View style={styles.listThumb}>
                {item.thumbnailUrl ? (
                  <View style={styles.listThumb}>
                    <Ionicons name="restaurant-outline" size={24} color={colors.text.placeholder} />
                  </View>
                ) : (
                  <Ionicons name="restaurant-outline" size={24} color={colors.text.placeholder} />
                )}
              </View>
              <View style={styles.listInfo}>
                <View style={styles.listRow}>
                  <Text style={styles.listName}>{item.name}</Text>
                  <TouchableOpacity
                    style={styles.heartBtn}
                    onPress={() => handleToggleFavorite(item.id)}
                  >
                    <Ionicons
                      name={item.isFavorite ? 'heart' : 'heart-outline'}
                      size={20}
                      color={item.isFavorite ? colors.primary : colors.text.placeholder}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.listMeta}>
                  {item.category.name} · 도보 {item.walkMinutes}분
                  {item.priceRange ? ` · ${priceRangeLabel(item.priceRange)}` : ''}
                </Text>
                {item.myVisit && (
                  <Text style={styles.listVisit}>
                    ★ {item.myVisit.rating.toFixed(1)} · {item.myVisit.visitCount}번 방문
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },

  // State
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
    gap: spacing.md,
  },
  stateText: {
    ...typo.body2,
    color: colors.text.secondary,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    height: 44,
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typo.body2,
    color: colors.text.primary,
  },

  // Chips
  chipScroll: {
    flexGrow: 0,
  },
  chipContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
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

  // Sort
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  sortText: {
    ...typo.caption,
    color: colors.text.secondary,
  },

  // List
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  listItem: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  listThumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.bg.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  listInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listName: {
    ...typo.body1,
    fontWeight: '600',
    color: colors.text.primary,
  },
  heartBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listMeta: {
    ...typo.body2,
    color: colors.text.secondary,
    marginTop: 2,
  },
  listVisit: {
    ...typo.caption,
    color: colors.rating,
    marginTop: 2,
  },
});
