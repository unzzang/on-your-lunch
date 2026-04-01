import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
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
import {
  useMe,
  useCategories,
  useAllergyTypes,
  useUpdatePreferences,
} from '@/services/hooks';
import { PriceRange } from '@on-your-lunch/shared-types';

const PRICE_OPTIONS = [
  { key: PriceRange.UNDER_10K, label: '~1만원' },
  { key: PriceRange.BETWEEN_10K_20K, label: '1~2만원' },
  { key: PriceRange.OVER_20K, label: '2만원~' },
];

/** 취향 수정 화면 */
export default function EditPreferenceScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const { data: categories = [] } = useCategories();
  const { data: allergyTypes = [] } = useAllergyTypes();
  const updatePreferences = useUpdatePreferences();

  const [preferredCats, setPreferredCats] = useState<string[]>([]);
  const [excludedCats, setExcludedCats] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>(
    PriceRange.BETWEEN_10K_20K,
  );

  useEffect(() => {
    if (me?.preferences) {
      setPreferredCats(me.preferences.preferredCategories.map((c) => c.id));
      setExcludedCats(me.preferences.excludedCategories.map((c) => c.id));
      setAllergies(me.preferences.allergies.map((a) => a.id));
      setPriceRange(me.preferences.preferredPriceRange);
    }
  }, [me]);

  const togglePreferred = (id: string) => {
    setPreferredCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleExcluded = (id: string) => {
    setExcludedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleAllergy = (id: string) => {
    setAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    await updatePreferences.mutateAsync({
      preferredCategoryIds: preferredCats,
      excludedCategoryIds: excludedCats,
      allergyTypeIds: allergies,
      preferredPriceRange: priceRange,
    });
    Alert.alert('', '취향 설정이 저장되었어요.');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sub Bar */}
      <View style={styles.subBar}>
        <Pressable style={styles.backArea} onPress={() => router.back()}>
          <CaretLeft size={20} color={colors.text.secondary} />
          <Text style={styles.backText}>뒤로</Text>
        </Pressable>
        <Text style={styles.subBarTitle}>취향 설정</Text>
        <Pressable onPress={handleSave}>
          <Text style={styles.saveText}>저장</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Preferred Categories */}
        <Text style={styles.sectionLabel}>좋아하는 음식</Text>
        <View style={styles.chipContainer}>
          {categories.map((cat) => {
            const isActive = preferredCats.includes(cat.id);
            return (
              <Pressable
                key={cat.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => togglePreferred(cat.id)}
              >
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Price Range */}
        <Text style={styles.sectionLabel}>가격대</Text>
        <View style={styles.priceRow}>
          {PRICE_OPTIONS.map((opt) => {
            const isActive = priceRange === opt.key;
            return (
              <Pressable
                key={opt.key}
                style={[styles.priceChip, isActive && styles.priceChipActive]}
                onPress={() => setPriceRange(opt.key)}
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

        <View style={styles.divider} />

        {/* Excluded Categories */}
        <Text style={styles.sectionLabel}>싫어하는 음식</Text>
        <View style={styles.chipContainer}>
          {categories.map((cat) => {
            const isActive = excludedCats.includes(cat.id);
            return (
              <Pressable
                key={cat.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => toggleExcluded(cat.id)}
              >
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Allergies */}
        <Text style={styles.sectionLabel}>알레르기</Text>
        <View style={styles.chipContainer}>
          {allergyTypes.map((allergy) => {
            const isActive = allergies.includes(allergy.id);
            return (
              <Pressable
                key={allergy.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => toggleAllergy(allergy.id)}
              >
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}
                >
                  {allergy.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>
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
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.body2.size,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 10,
    marginTop: spacing.lg,
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
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: spacing.xl,
  },
});
