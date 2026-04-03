// ─────────────────────────────────────────
// 취향 수정 화면
//
// 선호/제외 카테고리 + 알레르기 + 가격대 수정.
// 온보딩 Step 2, 3의 UI를 통합.
// ─────────────────────────────────────────

import { useState, useCallback, useEffect } from 'react';
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
import {
  useMe,
  useUpdatePreferences,
  useCategories,
  useAllergyTypes,
} from '@/services/hooks';
import { PriceRange } from '@on-your-lunch/shared-types';

const PRICE_OPTIONS: { label: string; value: PriceRange }[] = [
  { label: '~1만원', value: PriceRange.UNDER_10K },
  { label: '1~2만원', value: PriceRange.BETWEEN_10K_20K },
  { label: '2만원~', value: PriceRange.OVER_20K },
];

export default function EditPreferenceScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const { data: categories = [] } = useCategories();
  const { data: allergyTypes = [] } = useAllergyTypes();
  const updatePreferences = useUpdatePreferences();

  const [preferred, setPreferred] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>(PriceRange.UNDER_10K);

  useEffect(() => {
    if (me?.preferences) {
      setPreferred(me.preferences.preferredCategories.map((c) => c.id));
      setExcluded(me.preferences.excludedCategories.map((c) => c.id));
      setAllergies(me.preferences.allergies.map((a) => a.id));
      setPriceRange(me.preferences.preferredPriceRange);
    }
  }, [me]);

  const toggleList = useCallback(
    (list: string[], setList: (v: string[]) => void, id: string) => {
      setList(
        list.includes(id) ? list.filter((i) => i !== id) : [...list, id],
      );
    },
    [],
  );

  const handleSave = useCallback(() => {
    updatePreferences.mutate(
      {
        preferredCategoryIds: preferred,
        excludedCategoryIds: excluded,
        allergyTypeIds: allergies,
        preferredPriceRange: priceRange,
      },
      { onSuccess: () => router.back() },
    );
  }, [preferred, excluded, allergies, priceRange, updatePreferences, router]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 서브 바 */}
      <View style={styles.subBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backText}>{'‹ 뒤로'}</Text>
        </TouchableOpacity>
        <Text style={styles.subBarTitle}>취향 설정</Text>
        <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
          <Text style={styles.saveText}>
            {updatePreferences.isPending ? '...' : '저장'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        {/* 선호 카테고리 */}
        <Text style={styles.sectionLabel}>좋아하는 음식</Text>
        <View style={styles.chipsContainer}>
          {categories.map((cat) => {
            const isActive = preferred.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => toggleList(preferred, setPreferred, cat.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.separator} />

        {/* 가격대 */}
        <Text style={styles.sectionLabel}>선호 가격대</Text>
        <View style={styles.priceRow}>
          {PRICE_OPTIONS.map((opt) => {
            const isActive = priceRange === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.priceChip, isActive && styles.priceChipActive]}
                onPress={() => setPriceRange(opt.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.priceChipText,
                    isActive && styles.priceChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.separator} />

        {/* 제외 카테고리 */}
        <Text style={styles.sectionLabel}>싫어하는 음식</Text>
        <View style={styles.chipsContainer}>
          {categories.map((cat) => {
            const isActive = excluded.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => toggleList(excluded, setExcluded, cat.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.separator} />

        {/* 알레르기 */}
        <Text style={styles.sectionLabel}>알레르기</Text>
        <View style={styles.chipsContainer}>
          {allergyTypes.map((allergy) => {
            const isActive = allergies.includes(allergy.id);
            return (
              <TouchableOpacity
                key={allergy.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => toggleList(allergies, setAllergies, allergy.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}
                >
                  {allergy.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
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
  saveText: {
    ...Typography.body2,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  scroll: {
    flex: 1,
  },
  sectionLabel: {
    ...Typography.body2,
    fontWeight: '600',
    color: Colors.text.secondary,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
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
  separator: {
    height: 1,
    backgroundColor: Colors.border.default,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.xl,
  },
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
});
