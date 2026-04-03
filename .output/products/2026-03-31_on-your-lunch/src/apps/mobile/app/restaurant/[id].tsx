// ─────────────────────────────────────────
// 식당 상세 화면
//
// Hero 이미지 + 기본 정보 + 내 기록 + 지도 미리보기 + 하단 버튼(길찾기/먹었어요).
// 먹었어요 바텀시트 포함.
// 4가지 상태: 정상 / 로딩 / 빈 / 에러.
// ─────────────────────────────────────────

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/tokens';
import {
  useRestaurant,
  useFavoriteToggle,
  useCreateEatingHistory,
} from '@/services/hooks';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { PriceRange, MEMO_MAX_LENGTH } from '@on-your-lunch/shared-types';

function formatPriceRange(range: PriceRange | null): string {
  switch (range) {
    case PriceRange.UNDER_10K: return '~10,000원';
    case PriceRange.BETWEEN_10K_20K: return '10,000~20,000원';
    case PriceRange.OVER_20K: return '20,000원~';
    default: return '가격 정보 준비 중';
  }
}

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: restaurant, isLoading, isError, refetch } = useRestaurant(id ?? '');
  const favoriteMutation = useFavoriteToggle();
  const createHistoryMutation = useCreateEatingHistory();

  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [rating, setRating] = useState(0);
  const [memo, setMemo] = useState('');

  const handleFavoriteToggle = useCallback(() => {
    if (id) favoriteMutation.mutate(id);
  }, [id, favoriteMutation]);

  const handleSaveRecord = useCallback(() => {
    if (!id || rating === 0) return;
    const today = new Date().toISOString().split('T')[0];
    createHistoryMutation.mutate(
      {
        restaurantId: id,
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
        },
      },
    );
  }, [id, rating, memo, createHistoryMutation]);

  const handleNavigate = useCallback(() => {
    if (!restaurant) return;
    const url = `https://map.kakao.com/link/to/${restaurant.name},${restaurant.latitude},${restaurant.longitude}`;
    Linking.openURL(url);
  }, [restaurant]);

  const handlePhone = useCallback(() => {
    if (restaurant?.phone) {
      Linking.openURL(`tel:${restaurant.phone}`);
    }
  }, [restaurant]);

  // 로딩
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.heroSkeleton} />
        <View style={styles.contentPadding}>
          <View style={styles.skeletonLine1} />
          <View style={styles.skeletonLine2} />
          <View style={styles.skeletonLine2} />
        </View>
      </View>
    );
  }

  // 에러
  if (isError) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButtonAbsolute} onPress={() => router.back()}>
          <Text style={styles.backText}>{'‹ 뒤로'}</Text>
        </TouchableOpacity>
        <ErrorState onRetry={() => refetch()} />
      </View>
    );
  }

  // 빈 상태
  if (!restaurant) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButtonAbsolute} onPress={() => router.back()}>
          <Text style={styles.backText}>{'‹ 뒤로'}</Text>
        </TouchableOpacity>
        <EmptyState icon="🏪" title="식당 정보를 불러올 수 없어요" />
      </View>
    );
  }

  const hasVisit = !!restaurant.myVisit;
  const thumbnailUrl = restaurant.photos?.[0]?.imageUrl ?? restaurant.thumbnailUrl;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero 이미지 */}
        <View style={styles.heroContainer}>
          {thumbnailUrl ? (
            <Image source={{ uri: thumbnailUrl }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroPlaceholderIcon}>{'🍽'}</Text>
            </View>
          )}
          {/* 그라데이션 오버레이 */}
          <View style={styles.heroOverlay} />
          {/* 네비게이션 */}
          <View style={styles.heroNav}>
            <TouchableOpacity style={styles.heroNavButton} onPress={() => router.back()}>
              <Text style={styles.heroNavIcon}>{'‹'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroNavButton}>
              <Text style={styles.heroNavIcon}>{'⤴'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <TouchableOpacity style={styles.heartButton} onPress={handleFavoriteToggle}>
              <Text style={[styles.heartIcon, restaurant.isFavorite && styles.heartActive]}>
                {restaurant.isFavorite ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.categoryText}>
            {restaurant.category.name}
            {restaurant.description ? ` · ${restaurant.description}` : ''}
          </Text>
        </View>

        {/* 정보 리스트 */}
        <View style={styles.infoList}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>{'📍'}</Text>
            <Text style={styles.infoText}>
              도보 {restaurant.walkMinutes}분 · {restaurant.address}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>{'💰'}</Text>
            <Text style={styles.infoText}>{formatPriceRange(restaurant.priceRange)}</Text>
          </View>
          {restaurant.businessHours && (
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>{'🕐'}</Text>
              <Text style={styles.infoText}>{restaurant.businessHours}</Text>
            </View>
          )}
          {restaurant.phone && (
            <TouchableOpacity style={styles.infoItem} onPress={handlePhone}>
              <Text style={styles.infoIcon}>{'📞'}</Text>
              <Text style={[styles.infoText, styles.phoneLink]}>{restaurant.phone}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 내 기록 */}
        {hasVisit && restaurant.myVisit && (
          <View style={styles.myRecord}>
            <Text style={styles.myRecordLabel}>내 기록</Text>
            <Text style={styles.myRecordStats}>
              <Text style={styles.ratingStar}>{'★'}</Text>{' '}
              {restaurant.myVisit.rating.toFixed(1)} · {restaurant.myVisit.visitCount}번 방문
            </Text>
            {restaurant.myVisit.lastDate && (
              <Text style={styles.myRecordLast}>
                최근: {restaurant.myVisit.lastDate}
              </Text>
            )}
          </View>
        )}

        {/* 지도 미리보기 */}
        <TouchableOpacity style={styles.mapPreview} onPress={handleNavigate} activeOpacity={0.7}>
          <Text style={styles.mapPreviewIcon}>{'🗺'}</Text>
          <Text style={styles.mapPreviewText}>지도에서 위치 보기</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 하단 액션 버튼 */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionSecondary} onPress={handleNavigate} activeOpacity={0.7}>
          <Text style={styles.actionSecondaryIcon}>{'🗺'}</Text>
          <Text style={styles.actionSecondaryText}>길찾기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionPrimary}
          onPress={() => setShowBottomSheet(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionPrimaryIcon}>{'🍽'}</Text>
          <Text style={styles.actionPrimaryText}>먹었어요</Text>
        </TouchableOpacity>
      </View>

      {/* 먹었어요 바텀시트 */}
      <Modal visible={showBottomSheet} transparent animationType="slide" onRequestClose={() => setShowBottomSheet(false)}>
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setShowBottomSheet(false)}
        >
          <TouchableOpacity style={[styles.sheet, Shadow.lg]} activeOpacity={1}>
            {/* 핸들 */}
            <View style={styles.sheetHandle} />

            {/* 타이틀 */}
            <Text style={styles.sheetTitle}>{restaurant.name}에서 먹었군요!</Text>

            {/* 별점 */}
            <Text style={styles.sheetLabel}>별점을 남겨주세요</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)} activeOpacity={0.7}>
                  <Text style={[styles.starButton, s <= rating && styles.starButtonActive]}>
                    {'★'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 메모 */}
            <Text style={styles.sheetLabel}>한줄 메모 (선택)</Text>
            <TextInput
              style={styles.memoInput}
              placeholder="오늘 된장찌개가 맛있었어요"
              placeholderTextColor={Colors.text.placeholder}
              multiline
              maxLength={MEMO_MAX_LENGTH}
              value={memo}
              onChangeText={setMemo}
            />
            <Text style={styles.memoCount}>{memo.length}/{MEMO_MAX_LENGTH}자</Text>

            {/* 저장 */}
            <TouchableOpacity
              style={[styles.saveButton, rating === 0 && styles.saveButtonDisabled]}
              onPress={handleSaveRecord}
              disabled={rating === 0 || createHistoryMutation.isPending}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>
                {createHistoryMutation.isPending ? '저장 중...' : '저장하기'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  scrollContent: {
    paddingBottom: Spacing['3xl'],
  },
  // 스켈레톤
  heroSkeleton: {
    height: 280,
    backgroundColor: Colors.bg.tertiary,
  },
  contentPadding: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  skeletonLine1: {
    height: 24,
    width: '50%',
    backgroundColor: Colors.bg.tertiary,
    borderRadius: Radius.sm,
  },
  skeletonLine2: {
    height: 16,
    width: '80%',
    backgroundColor: Colors.bg.tertiary,
    borderRadius: Radius.sm,
  },
  backButtonAbsolute: {
    padding: Spacing.base,
  },
  backText: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  // Hero
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
    backgroundColor: Colors.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholderIcon: {
    fontSize: 48,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroNav: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    zIndex: 11,
  },
  heroNavButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroNavIcon: {
    fontSize: 24,
    color: Colors.text.inverse,
  },
  // 헤더
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    ...Typography.h1,
    color: Colors.text.primary,
    flex: 1,
  },
  heartButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 28,
    color: Colors.text.placeholder,
  },
  heartActive: {
    color: Colors.primary,
  },
  categoryText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  // 정보
  infoList: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    gap: Spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    ...Typography.body2,
    fontSize: 15,
    color: Colors.text.primary,
  },
  phoneLink: {
    color: Colors.primary,
  },
  // 내 기록
  myRecord: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    padding: Spacing.base,
    backgroundColor: Colors.bg.secondary,
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: Radius.lg,
  },
  myRecordLabel: {
    ...Typography.overline,
    color: Colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  myRecordStats: {
    ...Typography.body1,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  ratingStar: {
    color: Colors.rating,
  },
  myRecordLast: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 6,
  },
  // 지도 미리보기
  mapPreview: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    height: 160,
    backgroundColor: Colors.bg.tertiary,
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  mapPreviewIcon: {
    fontSize: 32,
  },
  mapPreviewText: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.text.placeholder,
  },
  // 하단 버튼
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: Colors.bg.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.default,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: 32,
    gap: Spacing.sm,
  },
  actionSecondary: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: Radius.md,
    gap: Spacing.sm,
  },
  actionSecondaryIcon: {
    fontSize: 20,
  },
  actionSecondaryText: {
    ...Typography.body2,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  actionPrimary: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    gap: Spacing.sm,
  },
  actionPrimaryIcon: {
    fontSize: 20,
  },
  actionPrimaryText: {
    ...Typography.body2,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  // 바텀시트
  sheetOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bg.primary,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 32,
    height: 4,
    backgroundColor: Colors.border.default,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  sheetTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  sheetLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  starButton: {
    fontSize: 32,
    color: Colors.border.default,
  },
  starButtonActive: {
    color: Colors.rating,
  },
  memoInput: {
    height: 80,
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    ...Typography.body2,
    color: Colors.text.primary,
    textAlignVertical: 'top',
  },
  memoCount: {
    ...Typography.caption,
    color: Colors.text.placeholder,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  saveButton: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.base,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.primaryDisabled,
  },
  saveButtonText: {
    ...Typography.body1,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});
