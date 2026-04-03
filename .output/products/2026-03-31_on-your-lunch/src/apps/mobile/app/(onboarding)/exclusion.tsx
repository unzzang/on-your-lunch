// ─────────────────────────────────────────
// 온보딩 Step 3: 제외 설정
//
// 알레르기 + 싫어하는 카테고리 복수 선택.
// 건너뛰기 가능. 완료 시 홈으로 이동.
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
import { useCategories, useAllergyTypes } from '@/services/hooks';

export default function ExclusionScreen() {
  const router = useRouter();
  const { setExclusions } = useOnboardingStore();
  const { data: categories = [] } = useCategories();
  const { data: allergyTypes = [] } = useAllergyTypes();

  const [excludedCategories, setExcludedCategories] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

  const toggleExcluded = useCallback((id: string) => {
    setExcludedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }, []);

  const toggleAllergy = useCallback((id: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }, []);

  const handleComplete = useCallback(() => {
    setExclusions(excludedCategories, selectedAllergies);
    router.replace('/(tabs)');
  }, [excludedCategories, selectedAllergies, setExclusions, router]);

  const handleSkip = useCallback(() => {
    setExclusions([], []);
    router.replace('/(tabs)');
  }, [setExclusions, router]);

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
                  i <= 6 && styles.progressSegmentActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.stepLabel}>Step 3/3</Text>
        </View>

        {/* 타이틀 */}
        <View style={styles.titleArea}>
          <Text style={styles.title}>빼고 싶은 게 있나요?</Text>
          <Text style={styles.description}>
            제외할 카테고리나 알레르기를 선택해주세요.
          </Text>
        </View>

        {/* 알레르기 */}
        <Text style={styles.sectionLabel}>알레르기</Text>
        <View style={styles.chipsContainer}>
          {allergyTypes.map((allergy) => {
            const isActive = selectedAllergies.includes(allergy.id);
            return (
              <TouchableOpacity
                key={allergy.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => toggleAllergy(allergy.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {allergy.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 싫어하는 음식 */}
        <Text style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>
          싫어하는 음식
        </Text>
        <View style={styles.chipsContainer}>
          {categories.map((cat) => {
            const isActive = excludedCategories.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => toggleExcluded(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* 하단 */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
          activeOpacity={0.7}
        >
          <Text style={styles.completeButtonText}>완료!</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>건너뛰기</Text>
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
  sectionLabel: {
    ...Typography.body2,
    fontWeight: '600',
    color: Colors.text.secondary,
    paddingHorizontal: Spacing.base,
    marginBottom: 10,
  },
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
  bottom: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
    paddingTop: Spacing.md,
  },
  completeButton: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButtonText: {
    ...Typography.body1,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  skipButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  skipButtonText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    textDecorationLine: 'underline',
  },
});
