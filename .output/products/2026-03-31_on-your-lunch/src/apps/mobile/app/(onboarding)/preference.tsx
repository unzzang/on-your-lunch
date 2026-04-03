// ─────────────────────────────────────────
// 온보딩 Step 2: 취향 + 가격대 설정
//
// 카테고리 복수선택(flex-wrap) + 가격대 단일선택.
// ─────────────────────────────────────────

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/tokens';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useCategories } from '@/services/hooks';
import { PriceRange } from '@on-your-lunch/shared-types';

const PRICE_OPTIONS: { label: string; value: PriceRange }[] = [
  { label: '~1만원', value: PriceRange.UNDER_10K },
  { label: '1~2만원', value: PriceRange.BETWEEN_10K_20K },
  { label: '2만원~', value: PriceRange.OVER_20K },
];

export default function PreferenceScreen() {
  const router = useRouter();
  const { setPreferences, setStep } = useOnboardingStore();
  const { data: categories = [] } = useCategories();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<PriceRange | null>(null);

  const toggleCategory = useCallback((id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }, []);

  const handleNext = useCallback(() => {
    if (selectedCategories.length === 0 || !selectedPrice) return;
    setPreferences(selectedCategories, selectedPrice);
    setStep(3);
    router.push('/(onboarding)/exclusion');
  }, [selectedCategories, selectedPrice, setPreferences, setStep, router]);

  const canProceed = selectedCategories.length > 0 && selectedPrice !== null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        {/* 뒤로 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>{'‹ 뒤로'}</Text>
        </TouchableOpacity>

        {/* 프로그레스 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View
                key={i}
                style={[
                  styles.progressSegment,
                  i <= 4 && styles.progressSegmentActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.stepLabel}>Step 2/3</Text>
        </View>

        {/* 타이틀 */}
        <View style={styles.titleArea}>
          <Text style={styles.title}>어떤 음식을 좋아하세요?</Text>
          <Text style={styles.description}>
            좋아하는 카테고리와 가격대를 선택해주세요.
          </Text>
        </View>

        {/* 카테고리 칩 */}
        <View style={styles.chipsContainer}>
          {categories.map((cat) => {
            const isActive = selectedCategories.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => toggleCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 구분선 */}
        <View style={styles.separator} />

        {/* 가격대 */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>선호 가격대</Text>
        </View>
        <View style={styles.priceRow}>
          {PRICE_OPTIONS.map((opt) => {
            const isActive = selectedPrice === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.priceChip, isActive && styles.priceChipActive]}
                onPress={() => setSelectedPrice(opt.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.priceChipText, isActive && styles.priceChipTextActive]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* 다음 버튼 */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canProceed}
          activeOpacity={0.7}
        >
          <Text style={styles.nextButtonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  scroll: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  backText: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  progressContainer: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
  },
  progressRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.bg.tertiary,
  },
  progressSegmentActive: {
    backgroundColor: Colors.primary,
  },
  stepLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  titleArea: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  description: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
  // 카테고리 칩
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border.default,
    backgroundColor: Colors.bg.primary,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.body2,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  chipTextActive: {
    color: Colors.text.inverse,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border.default,
    marginVertical: Spacing.xl,
    marginHorizontal: Spacing.base,
  },
  sectionLabel: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  sectionLabelText: {
    ...Typography.body2,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  // 가격대
  priceRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  priceChip: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.default,
    alignItems: 'center',
  },
  priceChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  priceChipText: {
    ...Typography.body2,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  priceChipTextActive: {
    color: Colors.text.inverse,
  },
  bottom: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
    paddingTop: Spacing.md,
  },
  nextButton: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: Colors.primaryDisabled,
  },
  nextButtonText: {
    ...Typography.body1,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});
