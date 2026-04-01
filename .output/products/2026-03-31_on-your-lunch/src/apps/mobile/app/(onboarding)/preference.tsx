import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import {
  colors,
  typography,
  spacing,
  radius,
} from '@/constants/tokens';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useCategories } from '@/services/hooks';
import { PriceRange } from '@on-your-lunch/shared-types';

const PRICE_OPTIONS = [
  { key: PriceRange.UNDER_10K, label: '~1만원' },
  { key: PriceRange.BETWEEN_10K_20K, label: '1~2만원' },
  { key: PriceRange.OVER_20K, label: '2만원~' },
];

/** 온보딩 Step 2: 취향 + 가격대 */
export default function PreferenceScreen() {
  const router = useRouter();
  const { preferredCategoryIds, preferredPriceRange, setPreferences } =
    useOnboardingStore();
  const { data: categories = [] } = useCategories();

  const [selectedCats, setSelectedCats] = useState<string[]>(
    preferredCategoryIds,
  );
  const [selectedPrice, setSelectedPrice] = useState<PriceRange | null>(
    preferredPriceRange,
  );

  const toggleCat = (id: string) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleNext = () => {
    if (selectedCats.length > 0 && selectedPrice) {
      setPreferences(selectedCats, selectedPrice);
      router.push('/(onboarding)/exclusion');
    }
  };

  const canProceed = selectedCats.length > 0 && selectedPrice !== null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <CaretLeft size={20} color={colors.text.secondary} />
          <Text style={styles.backText}>뒤로</Text>
        </Pressable>

        {/* Progress Bar */}
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

        {/* Step Label */}
        <Text style={styles.stepLabel}>Step 2/3</Text>

        {/* Title */}
        <Text style={styles.title}>어떤 음식을 좋아하세요?</Text>
        <Text style={styles.subtitle}>
          좋아하는 카테고리와 가격대를 선택해주세요.
        </Text>

        {/* Category Chips */}
        <View style={styles.chipContainer}>
          {categories.map((cat) => {
            const isActive = selectedCats.includes(cat.id);
            return (
              <Pressable
                key={cat.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => toggleCat(cat.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isActive && styles.chipTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Price Range */}
        <Text style={styles.sectionLabel}>가격대</Text>
        <View style={styles.priceRow}>
          {PRICE_OPTIONS.map((opt) => {
            const isActive = selectedPrice === opt.key;
            return (
              <Pressable
                key={opt.key}
                style={[
                  styles.priceChip,
                  isActive && styles.priceChipActive,
                ]}
                onPress={() => setSelectedPrice(opt.key)}
              >
                <Text
                  style={[
                    styles.priceChipText,
                    isActive && styles.priceChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.bottom}>
        <Pressable
          style={[
            styles.ctaButton,
            !canProceed && styles.ctaButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canProceed}
        >
          <Text style={styles.ctaButtonText}>다음</Text>
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
  scrollContent: {
    flex: 1,
    paddingHorizontal: spacing.base,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  backText: {
    fontSize: typography.body2.size,
    color: colors.text.secondary,
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.bg.tertiary,
  },
  progressSegmentActive: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    fontSize: typography.caption.size,
    color: colors.text.secondary,
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.h2.size,
    fontWeight: '700',
    lineHeight: typography.h2.lineHeight,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.body2.size,
    lineHeight: typography.body2.lineHeight,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.primary,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.body2.size,
    fontWeight: '500',
    color: colors.text.primary,
  },
  chipTextActive: {
    color: colors.text.inverse,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.body2.size,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priceChip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
  },
  priceChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priceChipText: {
    fontSize: typography.body2.size,
    fontWeight: '500',
    color: colors.text.primary,
  },
  priceChipTextActive: {
    color: colors.text.inverse,
  },
  bottom: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  ctaButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  ctaButtonText: {
    fontSize: typography.body1.size,
    fontWeight: '700',
    color: colors.text.inverse,
  },
});
