import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CaretRight, Check } from 'phosphor-react-native';
import {
  colors,
  typography,
  spacing,
  radius,
} from '@/constants/tokens';

interface TermItem {
  key: string;
  label: string;
  required: boolean;
}

const TERMS: TermItem[] = [
  { key: 'service', label: '서비스 이용약관', required: true },
  { key: 'privacy', label: '개인정보 처리방침', required: true },
  { key: 'location', label: '위치정보 이용약관', required: true },
  { key: 'marketing', label: '마케팅 수신 동의', required: false },
];

/** 약관 동의 화면 */
export default function TermsScreen() {
  const router = useRouter();
  const [agreed, setAgreed] = useState<Set<string>>(new Set());

  const allAgreed = TERMS.every((t) => agreed.has(t.key));
  const requiredAgreed = TERMS.filter((t) => t.required).every((t) =>
    agreed.has(t.key),
  );

  const toggleItem = (key: string) => {
    setAgreed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (allAgreed) {
      setAgreed(new Set());
    } else {
      setAgreed(new Set(TERMS.map((t) => t.key)));
    }
  };

  const handleConfirm = () => {
    if (requiredAgreed) {
      router.push('/(onboarding)/location');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>약관 동의</Text>

        {/* All Agree */}
        <Pressable style={styles.allAgreeRow} onPress={toggleAll}>
          <View style={[styles.checkbox, allAgreed && styles.checkboxActive]}>
            {allAgreed && <Check size={16} color={colors.text.inverse} weight="bold" />}
          </View>
          <Text style={styles.allAgreeText}>전체 동의</Text>
        </Pressable>

        <View style={styles.divider} />

        {/* Individual Terms */}
        {TERMS.map((term) => {
          const isChecked = agreed.has(term.key);
          return (
            <View key={term.key} style={styles.termRow}>
              <Pressable
                style={styles.termCheckArea}
                onPress={() => toggleItem(term.key)}
              >
                <View
                  style={[
                    styles.checkbox,
                    isChecked && styles.checkboxActive,
                  ]}
                >
                  {isChecked && (
                    <Check
                      size={16}
                      color={colors.text.inverse}
                      weight="bold"
                    />
                  )}
                </View>
                <Text style={styles.termLabel}>
                  {term.label}{' '}
                  <Text style={styles.termRequired}>
                    ({term.required ? '필수' : '선택'})
                  </Text>
                </Text>
              </Pressable>
              <Pressable style={styles.termArrow}>
                <CaretRight
                  size={20}
                  color={colors.text.placeholder}
                />
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* CTA */}
      <View style={styles.bottom}>
        <Pressable
          style={[
            styles.ctaButton,
            !requiredAgreed && styles.ctaButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!requiredAgreed}
        >
          <Text style={styles.ctaButtonText}>동의하고 시작하기</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.base,
  },
  title: {
    fontSize: typography.h2.size,
    fontWeight: '700',
    color: colors.text.primary,
    paddingVertical: spacing.base,
  },
  allAgreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    gap: spacing.md,
  },
  allAgreeText: {
    fontSize: typography.h3.size,
    fontWeight: typography.h3.weight,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  termCheckArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  termLabel: {
    fontSize: typography.body2.size,
    color: colors.text.primary,
  },
  termRequired: {
    fontSize: typography.caption.size,
    color: colors.text.secondary,
  },
  termArrow: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
