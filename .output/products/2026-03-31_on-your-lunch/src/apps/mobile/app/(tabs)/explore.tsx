import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typo, spacing, radius, shadow } from '../../constants/tokens';

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

const MOCK_RESTAURANTS = [
  {
    id: '1',
    name: '을지로 골목식당',
    category: '한식',
    walkMinutes: 3,
    priceRange: '~1만원',
    rating: 4.0,
    visitCount: 3,
    isFavorite: true,
  },
  {
    id: '2',
    name: '파스타공방',
    category: '양식',
    walkMinutes: 5,
    priceRange: '~1.5만원',
    rating: null,
    visitCount: 0,
    isFavorite: false,
  },
  {
    id: '3',
    name: '스시히로',
    category: '일식',
    walkMinutes: 8,
    priceRange: '~2만원',
    rating: 4.5,
    visitCount: 1,
    isFavorite: true,
  },
  {
    id: '4',
    name: '베트남쌀국수',
    category: '아시안',
    walkMinutes: 6,
    priceRange: '~1만원',
    rating: null,
    visitCount: 0,
    isFavorite: false,
  },
];

export default function ExploreTab() {
  const insets = useSafeAreaInsets();
  const selectedCategory = 'all';

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
        {CATEGORIES.map((cat) => {
          const isActive = cat.id === selectedCategory;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
            >
              <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={[styles.chip, styles.chipInactive]}>
          <Ionicons name="heart-outline" size={14} color={colors.text.secondary} />
          <Text style={[styles.chipText, styles.chipTextInactive]}> 즐겨찾기</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Sort */}
      <View style={styles.sortRow}>
        <Text style={styles.sortText}>거리순</Text>
        <Ionicons name="chevron-down-outline" size={14} color={colors.text.secondary} />
      </View>

      {/* Restaurant List */}
      <FlatList
        data={MOCK_RESTAURANTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <View style={styles.listThumb}>
              <Ionicons name="restaurant-outline" size={24} color={colors.text.placeholder} />
            </View>
            <View style={styles.listInfo}>
              <View style={styles.listRow}>
                <Text style={styles.listName}>{item.name}</Text>
                <TouchableOpacity style={styles.heartBtn}>
                  <Ionicons
                    name={item.isFavorite ? 'heart' : 'heart-outline'}
                    size={20}
                    color={item.isFavorite ? colors.primary : colors.text.placeholder}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.listMeta}>
                {item.category} · 도보 {item.walkMinutes}분 · {item.priceRange}
              </Text>
              {item.rating && (
                <Text style={styles.listVisit}>
                  ★ {item.rating} · {item.visitCount}번 방문
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
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
