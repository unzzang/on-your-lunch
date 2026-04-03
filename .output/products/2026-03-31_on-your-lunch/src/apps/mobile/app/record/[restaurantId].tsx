// ─────────────────────────────────────────
// 먹었어요 기록 화면
//
// 별점(1~5) + 한줄 메모(최대 300자).
// 식당 상세에서 push로 진입, 또는 이력에서 직접 기록.
// ─────────────────────────────────────────

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/tokens';
import { useRestaurant, useCreateEatingHistory } from '@/services/hooks';
import { MEMO_MAX_LENGTH } from '@on-your-lunch/shared-types';

export default function RecordScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();

  const { data: restaurant } = useRestaurant(restaurantId ?? '');
  const createHistory = useCreateEatingHistory();

  const [rating, setRating] = useState(0);
  const [memo, setMemo] = useState('');

  const handleSave = useCallback(() => {
    if (!restaurantId || rating === 0) return;
    const today = new Date().toISOString().split('T')[0];
    createHistory.mutate(
      {
        restaurantId,
        eatenDate: today,
        rating,
        memo: memo || undefined,
        isFromRecommendation: false,
      },
      {
        onSuccess: () => {
          router.back();
        },
      },
    );
  }, [restaurantId, rating, memo, createHistory, router]);

  const restaurantName = restaurant?.name ?? '식당';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 서브 바 */}
        <View style={styles.subBar}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.backText}>{'‹ 뒤로'}</Text>
          </TouchableOpacity>
          <Text style={styles.subBarTitle}>먹었어요</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 타이틀 */}
          <Text style={styles.title}>{restaurantName}에서 먹었군요!</Text>

          {/* 별점 */}
          <Text style={styles.label}>별점을 남겨주세요</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setRating(s)}
                activeOpacity={0.7}
                style={styles.starTouchable}
              >
                <Text style={[styles.star, s <= rating && styles.starActive]}>
                  {'★'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 메모 */}
          <Text style={styles.label}>한줄 메모 (선택)</Text>
          <TextInput
            style={styles.memoInput}
            placeholder="오늘 된장찌개가 맛있었어요"
            placeholderTextColor={Colors.text.placeholder}
            multiline
            maxLength={MEMO_MAX_LENGTH}
            value={memo}
            onChangeText={setMemo}
            textAlignVertical="top"
          />
          <Text style={styles.memoCount}>
            {memo.length}/{MEMO_MAX_LENGTH}자
          </Text>
        </ScrollView>

        {/* 저장 버튼 */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              rating === 0 && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={rating === 0 || createHistory.isPending}
            activeOpacity={0.7}
          >
            <Text style={styles.saveButtonText}>
              {createHistory.isPending ? '저장 중...' : '저장하기'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  flex: {
    flex: 1,
  },
  subBar: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.default,
  },
  backText: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  subBarTitle: {
    ...Typography.body1,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xl,
  },
  label: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  starTouchable: {
    padding: Spacing.xs,
  },
  star: {
    fontSize: 32,
    color: Colors.border.default,
  },
  starActive: {
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
  },
  memoCount: {
    ...Typography.caption,
    color: Colors.text.placeholder,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  bottom: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
    paddingTop: Spacing.md,
  },
  saveButton: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
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
