import {
  View,
  Text,
  StyleSheet,
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
    walkMinutes: 8,
    priceRange: '~1만원',
    isFavorite: false,
  },
  {
    id: '2',
    name: '파스타공방',
    category: '양식',
    walkMinutes: 5,
    priceRange: '~1.5만원',
    isFavorite: true,
  },
  {
    id: '3',
    name: '스시히로',
    category: '일식',
    walkMinutes: 10,
    priceRange: '~2만원',
    isFavorite: false,
  },
];

type CategoryItem = (typeof CATEGORIES)[number];
type Restaurant = (typeof MOCK_RESTAURANTS)[number];

export default function HomeTab() {
  const insets = useSafeAreaInsets();
  const selectedCategory = 'all';
  const refreshCount = 4;
  const maxRefresh = 5;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.logo}>온유어런치</Text>
        <TouchableOpacity style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Recommendation Cards */}
        {MOCK_RESTAURANTS.map((restaurant: Restaurant) => (
          <TouchableOpacity key={restaurant.id} style={styles.card} activeOpacity={0.7}>
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
                {restaurant.category} · 도보 {restaurant.walkMinutes}분 · {restaurant.priceRange}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Refresh Button */}
        <TouchableOpacity style={styles.refreshButton} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={20} color={colors.primary} />
          <Text style={styles.refreshText}>
            다른 추천 보기 ({refreshCount}/{maxRefresh})
          </Text>
        </TouchableOpacity>

        <View style={{ height: spacing.lg }} />
      </ScrollView>
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

  // Scroll
  scrollView: {
    flex: 1,
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
