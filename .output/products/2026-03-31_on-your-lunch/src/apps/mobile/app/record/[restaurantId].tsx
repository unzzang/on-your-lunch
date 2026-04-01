import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CaretLeft, Star } from 'phosphor-react-native';
import {
  colors,
  typography,
  spacing,
  radius,
} from '@/constants/tokens';
import { useCreateEatingHistory, useRestaurant } from '@/services/hooks';
import { MEMO_MAX_LENGTH } from '@on-your-lunch/shared-types';

/** 먹었어요 기록 화면 (모달 프레젠테이션) */
export default function RecordScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();
  const isNew = restaurantId === 'new';

  const { data: restaurant } = useRestaurant(isNew ? '' : (restaurantId ?? ''));
  const createHistory = useCreateEatingHistory();

  const [rating, setRating] = useState(0);
  const [memo, setMemo] = useState('');

  const handleSave = () => {
    if (rating === 0 || !restaurantId || isNew) return;
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
          Alert.alert('', '기록이 저장되었어요!');
          router.back();
        },
      },
    );
  };

  const restaurantName = restaurant?.name ?? '식당';

  return (
    <SafeAreaView style={styles.container}>
      {/* Sub Bar */}
      <View style={styles.subBar}>
        <Pressable
          style={styles.backArea}
          onPress={() => router.back()}
        >
          <CaretLeft size={20} color={colors.text.secondary} />
          <Text style={styles.backText}>닫기</Text>
        </Pressable>
        <Text style={styles.subBarTitle}>먹었어요</Text>
        <View style={{ minWidth: 60 }} />
      </View>

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>
          {isNew ? '오늘 점심 기록' : `${restaurantName}에서 먹었군요!`}
        </Text>

        {/* Rating */}
        <Text style={styles.label}>별점을 남겨주세요</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setRating(star)} hitSlop={4}>
              <Star
                size={40}
                color={
                  star <= rating ? colors.rating : colors.border.default
                }
                weight={star <= rating ? 'fill' : 'regular'}
              />
            </Pressable>
          ))}
        </View>

        {/* Memo */}
        <Text style={styles.label}>한줄 메모 (선택)</Text>
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
      </View>

      {/* Save Button */}
      <View style={styles.bottom}>
        <Pressable
          style={[
            styles.saveButton,
            (rating === 0 || isNew) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={rating === 0 || isNew || createHistory.isPending}
        >
          <Text style={styles.saveButtonText}>저장하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  subBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  backArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 60,
  },
  backText: {
    fontSize: typography.body2.size,
    color: colors.text.secondary,
  },
  subBarTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: typography.h3.size,
    fontWeight: typography.h3.weight,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.body2.size,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
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
  },
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
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
