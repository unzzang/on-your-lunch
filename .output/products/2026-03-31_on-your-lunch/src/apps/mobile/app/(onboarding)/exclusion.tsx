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
import {
  useCategories,
  useAllergyTypes,
  useCompleteOnboarding,
  useUpdateLocation,
  useUpdatePreferences,
} from '@/services/hooks';

/** 온보딩 Step 3: 제외 설정 (알레르기, 싫어하는 카테고리) */
export default function ExclusionScreen() {
  const router = useRouter();
  const {
    excludedCategoryIds: storedExcluded,
    allergyTypeIds: storedAllergies,
    setExclusions,
    location,
    preferredCategoryIds,
    preferredPriceRange,
    reset,
  } = useOnboardingStore();

  const { data: categories = [] } = useCategories();
  const { data: allergyTypes = [] } = useAllergyTypes();
  const completeOnboarding = useCompleteOnboarding();
  const updateLocation = useUpdateLocation();
  const updatePreferences = useUpdatePreferences();

  const [excludedCats, setExcludedCats] = useState<string[]>(storedExcluded);
  const [selectedAllergies, setSelectedAllergies] =
    useState<string[]>(storedAllergies);

  const toggleExcludedCat = (id: string) => {
    setExcludedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleAllergy = (id: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const handleComplete = async () => {
    setExclusions(excludedCats, selectedAllergies);

    // Submit onboarding data
    if (location.latitude && location.longitude) {
      await updateLocation.mutateAsync({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        buildingName: location.buildingName || undefined,
      });
    }

    if (preferredPriceRange) {
      await updatePreferences.mutateAsync({
        preferredCategoryIds,
        excludedCategoryIds: excludedCats,
        allergyTypeIds: selectedAllergies,
        preferredPriceRange,
      });
    }

    await completeOnboarding.mutateAsync();
    reset();
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    setExclusions([], []);
    handleComplete();
  };

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
                i <= 6 && styles.progressSegmentActive,
              ]}
            />
          ))}
        </View>

        {/* Step Label */}
        <Text style={styles.stepLabel}>Step 3/3</Text>

        {/* Title */}
        <Text style={styles.title}>빼고 싶은 건 있나요?</Text>
        <Text style={styles.subtitle}>
          싫어하는 음식이나 알레르기가 있으면 제외할게요.
        </Text>

        {/* Allergy Section */}
        <Text style={styles.sectionLabel}>알레르기</Text>
        <View style={styles.chipContainer}>
          {allergyTypes.map((allergy) => {
            const isActive = selectedAllergies.includes(allergy.id);
            return (
              <Pressable
                key={allergy.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => toggleAllergy(allergy.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isActive && styles.chipTextActive,
                  ]}
                >
                  {allergy.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Excluded categories */}
        <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>
          싫어하는 음식
        </Text>
        <View style={styles.chipContainer}>
          {categories.map((cat) => {
            const isActive = excludedCats.includes(cat.id);
            return (
              <Pressable
                key={cat.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => toggleExcludedCat(cat.id)}
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

        {/* Skip link */}
        <Pressable style={styles.skipLink} onPress={handleSkip}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </Pressable>
      </ScrollView>

      {/* CTA */}
      <View style={styles.bottom}>
        <Pressable style={styles.ctaButton} onPress={handleComplete}>
          <Text style={styles.ctaButtonText}>완료!</Text>
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
  sectionLabel: {
    fontSize: typography.body2.size,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 10,
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
  skipLink: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  skipText: {
    fontSize: typography.body2.size,
    color: colors.text.secondary,
    textDecorationLine: 'underline',
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
    marginTop: spacing.md,
  },
  ctaButtonText: {
    fontSize: typography.body1.size,
    fontWeight: '700',
    color: colors.text.inverse,
  },
});
