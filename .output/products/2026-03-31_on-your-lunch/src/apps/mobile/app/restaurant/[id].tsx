import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Linking,
  Alert,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CaretLeft,
  ShareNetwork,
  Heart,
  MapPin,
  CurrencyKrw,
  Clock,
  Phone,
  ForkKnife,
  MapTrifold,
  Star,
  Storefront,
  PencilSimple,
} from 'phosphor-react-native';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '@/constants/tokens';
import {
  useRestaurant,
  useToggleFavorite,
  useCreateEatingHistory,
} from '@/services/hooks';
import { PriceRange, MEMO_MAX_LENGTH } from '@on-your-lunch/shared-types';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import SkeletonCard from '@/components/SkeletonCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function formatPriceRange(pr: PriceRange | null): string {
  switch (pr) {
    case PriceRange.UNDER_10K:
      return '~10,000원';
    case PriceRange.BETWEEN_10K_20K:
      return '10,000~20,000원';
    case PriceRange.OVER_20K:
      return '20,000원~';
    default:
      return '가격 정보 준비 중';
  }
}

/** 식당 상세 화면 */
export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [rating, setRating] = useState(0);
  const [memo, setMemo] = useState('');
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const {
    data: restaurant,
    isLoading,
    isError,
    refetch,
  } = useRestaurant(id ?? '');
  const toggleFavoriteMutation = useToggleFavorite();
  const createHistoryMutation = useCreateEatingHistory();

  const handleFavoritePress = useCallback(() => {
    if (!restaurant) return;
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    toggleFavoriteMutation.mutate({ restaurantId: restaurant.id });
  }, [restaurant, scaleAnim, toggleFavoriteMutation]);

  const handleSaveRecord = () => {
    if (!restaurant || rating === 0) return;
    const today = new Date().toISOString().split('T')[0];
    createHistoryMutation.mutate(
      {
        restaurantId: restaurant.id,
        eatenDate: today,
        rating,
        memo: memo || undefined,
        isFromRecommendation: false,
      },
      {
        onSuccess: () => {
          setShowBottomSheet(false);
          setRating(0);
          setMemo('');
          Alert.alert('', '기록이 저장되었어요!');
        },
      },
    );
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.heroSkeleton, { paddingTop: insets.top }]}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <CaretLeft size={24} color={colors.text.primary} />
          </Pressable>
        </View>
        <SkeletonCard />
      </View>
    );
  }

  if (isError || !restaurant) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable
          style={[styles.backButtonFlat, { marginTop: spacing.sm }]}
          onPress={() => router.back()}
        >
          <CaretLeft size={24} color={colors.text.primary} />
        </Pressable>
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <EmptyState
            icon={
              <Storefront
                size={48}
                color={colors.text.placeholder}
                weight="light"
              />
            }
            title="식당 정보를 불러올 수 없어요"
          />
        )}
      </View>
    );
  }

  const hasVisit = !!restaurant.myVisit;
  const todayStr = new Date().toISOString().split('T')[0];
  const hasRecordToday =
    hasVisit && restaurant.myVisit?.lastDate === todayStr;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {restaurant.thumbnailUrl ? (
            <Image
              source={{ uri: restaurant.thumbnailUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <ForkKnife
                size={48}
                color={colors.text.placeholder}
                weight="light"
              />
            </View>
          )}

          {/* Gradient overlay */}
          <View style={styles.heroGradient} />

          {/* Navigation */}
          <View style={[styles.heroNav, { paddingTop: insets.top + spacing.sm }]}>
            <Pressable
              style={styles.heroNavButton}
              onPress={() => router.back()}
            >
              <CaretLeft size={24} color={colors.text.inverse} />
            </Pressable>
            <Pressable style={styles.heroNavButton}>
              <ShareNetwork size={24} color={colors.text.inverse} />
            </Pressable>
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerNameRow}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Pressable
              onPress={handleFavoritePress}
              hitSlop={10}
              style={styles.heartButton}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Heart
                  size={28}
                  color={
                    restaurant.isFavorite
                      ? colors.primary
                      : colors.text.placeholder
                  }
                  weight={restaurant.isFavorite ? 'fill' : 'regular'}
                />
              </Animated.View>
            </Pressable>
          </View>
          <Text style={styles.categoryText}>
            {restaurant.category.name}
            {restaurant.description ? ` \u00B7 ${restaurant.description}` : ''}
          </Text>
        </View>

        {/* Info List */}
        <View style={styles.infoList}>
          <View style={styles.infoItem}>
            <MapPin size={20} color={colors.text.secondary} />
            <Text style={styles.infoText}>
              도보 {restaurant.walkMinutes}분 \u00B7 {restaurant.address}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <CurrencyKrw size={20} color={colors.text.secondary} />
            <Text style={styles.infoText}>
              {formatPriceRange(restaurant.priceRange)}
            </Text>
          </View>

          {restaurant.businessHours && (
            <View style={styles.infoItem}>
              <Clock size={20} color={colors.text.secondary} />
              <Text style={styles.infoText}>{restaurant.businessHours}</Text>
            </View>
          )}

          {restaurant.phone && (
            <Pressable
              style={styles.infoItem}
              onPress={() => handleCall(restaurant.phone!)}
            >
              <Phone size={20} color={colors.text.secondary} />
              <Text style={[styles.infoText, { color: colors.primary }]}>
                {restaurant.phone}
              </Text>
            </Pressable>
          )}
        </View>

        {/* My Record */}
        {hasVisit && restaurant.myVisit && (
          <View style={styles.myRecord}>
            <Text style={styles.myRecordLabel}>내 기록</Text>
            <View style={styles.myRecordStats}>
              <Star size={16} color={colors.rating} weight="fill" />
              <Text style={styles.myRecordStatsText}>
                {' '}
                {restaurant.myVisit.rating.toFixed(1)} \u00B7{' '}
                {restaurant.myVisit.visitCount}번 방문
              </Text>
            </View>
          </View>
        )}

        {/* Map Preview */}
        <Pressable style={styles.mapPreview}>
          <MapTrifold size={32} color={colors.text.placeholder} weight="light" />
          <Text style={styles.mapPreviewText}>지도에서 위치 보기</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={styles.buttonSecondary}
          onPress={() => {
            // Open maps
            const url = `kakaomap://look?p=${restaurant.latitude},${restaurant.longitude}`;
            Linking.canOpenURL(url)
              .then((supported) => {
                if (supported) Linking.openURL(url);
                else
                  Linking.openURL(
                    `https://map.kakao.com/link/to/${restaurant.name},${restaurant.latitude},${restaurant.longitude}`,
                  );
              })
              .catch(() => {});
          }}
        >
          <MapTrifold size={20} color={colors.text.primary} />
          <Text style={styles.buttonSecondaryText}>길찾기</Text>
        </Pressable>

        <Pressable
          style={[
            hasRecordToday ? styles.buttonSecondary : styles.buttonPrimary,
          ]}
          onPress={() => setShowBottomSheet(true)}
        >
          {hasRecordToday ? (
            <>
              <PencilSimple size={20} color={colors.text.primary} />
              <Text style={styles.buttonSecondaryText}>기록 수정</Text>
            </>
          ) : (
            <>
              <ForkKnife size={20} color={colors.text.inverse} />
              <Text style={styles.buttonPrimaryText}>먹었어요</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={showBottomSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBottomSheet(false)}
      >
        <Pressable
          style={styles.sheetOverlay}
          onPress={() => setShowBottomSheet(false)}
        >
          <Pressable
            style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}
            onPress={(e) => e.stopPropagation?.()}
          >
            {/* Handle */}
            <View style={styles.sheetHandle} />

            {/* Title */}
            <Text style={styles.sheetTitle}>
              {restaurant.name}에서 먹었군요!
            </Text>

            {/* Rating */}
            <Text style={styles.sheetLabel}>별점을 남겨주세요</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setRating(star)}
                  hitSlop={4}
                >
                  <Star
                    size={32}
                    color={star <= rating ? colors.rating : colors.border.default}
                    weight={star <= rating ? 'fill' : 'regular'}
                  />
                </Pressable>
              ))}
            </View>

            {/* Memo */}
            <Text style={styles.sheetLabel}>한줄 메모 (선택)</Text>
            <TextInput
              style={styles.memoInput}
              placeholder="오늘 된장찌개가 맛있었어요"
              placeholderTextColor={colors.text.placeholder}
              multiline
              maxLength={MEMO_MAX_LENGTH}
              value={memo}
              onChangeText={setMemo}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {memo.length}/{MEMO_MAX_LENGTH}자
            </Text>

            {/* Save Button */}
            <Pressable
              style={[
                styles.saveButton,
                rating === 0 && styles.saveButtonDisabled,
              ]}
              onPress={handleSaveRecord}
              disabled={rating === 0 || createHistoryMutation.isPending}
            >
              <Text style={styles.saveButtonText}>저장하기</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  heroContainer: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    zIndex: 11,
  },
  heroNavButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSkeleton: {
    height: 280,
    backgroundColor: colors.bg.tertiary,
    paddingHorizontal: spacing.base,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonFlat: {
    paddingHorizontal: spacing.base,
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
  },
  headerNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    flex: 1,
    fontSize: typography.h1.size,
    fontWeight: typography.h1.weight,
    lineHeight: typography.h1.lineHeight,
    color: colors.text.primary,
  },
  heartButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: typography.body2.size,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  infoList: {
    padding: spacing.base,
    gap: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  myRecord: {
    marginHorizontal: spacing.base,
    padding: spacing.base,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
  },
  myRecordLabel: {
    fontSize: typography.overline.size,
    fontWeight: typography.overline.weight,
    color: colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  myRecordStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myRecordStatsText: {
    fontSize: typography.body1.size,
    fontWeight: '600',
    color: colors.text.primary,
  },
  mapPreview: {
    margin: spacing.base,
    height: 160,
    backgroundColor: colors.bg.tertiary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPreviewText: {
    fontSize: 13,
    color: colors.text.placeholder,
    marginTop: spacing.sm,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.bg.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  buttonSecondary: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    backgroundColor: colors.bg.primary,
  },
  buttonSecondaryText: {
    fontSize: typography.body2.size,
    fontWeight: '500',
    color: colors.text.primary,
  },
  buttonPrimary: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  buttonPrimaryText: {
    fontSize: typography.body2.size,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  // Bottom Sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg.primary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    ...shadows.lg,
  },
  sheetHandle: {
    width: 32,
    height: 4,
    backgroundColor: colors.border.default,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    fontSize: typography.h3.size,
    fontWeight: typography.h3.weight,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  sheetLabel: {
    fontSize: typography.body2.size,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  memoInput: {
    height: 80,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  charCount: {
    fontSize: typography.caption.size,
    color: colors.text.placeholder,
    textAlign: 'right',
    marginBottom: spacing.base,
  },
  saveButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  saveButtonText: {
    fontSize: typography.body2.size,
    fontWeight: '700',
    color: colors.text.inverse,
  },
});
