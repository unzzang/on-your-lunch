// ─────────────────────────────────────────
// 약관 동의 화면
//
// 전체 동의 + 개별 체크박스(필수 3개 + 선택 1개).
// 필수 약관 동의 시 버튼 활성화.
// ─────────────────────────────────────────

import { useState, useCallback, useMemo } from 'react';
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

interface TermItem {
  id: string;
  label: string;
  required: boolean;
}

const TERMS: TermItem[] = [
  { id: 'service', label: '서비스 이용약관', required: true },
  { id: 'privacy', label: '개인정보 처리방침', required: true },
  { id: 'location', label: '위치정보 이용약관', required: true },
  { id: 'marketing', label: '마케팅 수신 동의', required: false },
];

export default function TermsScreen() {
  const router = useRouter();
  const [agreed, setAgreed] = useState<Record<string, boolean>>({});

  const allChecked = TERMS.every((t) => agreed[t.id]);
  const requiredChecked = TERMS.filter((t) => t.required).every((t) => agreed[t.id]);

  const handleToggleAll = useCallback(() => {
    if (allChecked) {
      setAgreed({});
    } else {
      const all: Record<string, boolean> = {};
      TERMS.forEach((t) => (all[t.id] = true));
      setAgreed(all);
    }
  }, [allChecked]);

  const handleToggle = useCallback((id: string) => {
    setAgreed((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!requiredChecked) return;
    router.push('/(onboarding)/location');
  }, [requiredChecked, router]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        {/* 타이틀 */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>약관 동의</Text>
        </View>

        {/* 전체 동의 */}
        <TouchableOpacity
          style={styles.allAgreeRow}
          onPress={handleToggleAll}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, allChecked && styles.checkboxChecked]}>
            {allChecked && <Text style={styles.checkmark}>{'✓'}</Text>}
          </View>
          <Text style={styles.allAgreeText}>전체 동의</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        {/* 개별 약관 */}
        {TERMS.map((term) => (
          <TouchableOpacity
            key={term.id}
            style={styles.termRow}
            onPress={() => handleToggle(term.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreed[term.id] && styles.checkboxChecked]}>
              {agreed[term.id] && <Text style={styles.checkmark}>{'✓'}</Text>}
            </View>
            <View style={styles.termLabelContainer}>
              <Text style={styles.termLabel}>{term.label}</Text>
              <Text style={styles.termRequired}>
                {term.required ? '(필수)' : '(선택)'}
              </Text>
            </View>
            <Text style={styles.termArrow}>{'›'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 동의 버튼 */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            !requiredChecked && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!requiredChecked}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>동의하고 시작하기</Text>
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
  titleSection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
  },
  title: {
    ...Typography.h2,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  // 전체 동의
  allAgreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    gap: Spacing.md,
  },
  allAgreeText: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border.default,
    marginHorizontal: Spacing.base,
  },
  // 개별 약관
  termRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    gap: Spacing.md,
  },
  termLabelContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  termLabel: {
    ...Typography.body2,
    color: Colors.text.primary,
  },
  termRequired: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  termArrow: {
    fontSize: 20,
    color: Colors.text.placeholder,
  },
  // 체크박스
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.inverse,
  },
  // 하단
  bottom: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  submitButton: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.primaryDisabled,
  },
  submitButtonText: {
    ...Typography.body1,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});
