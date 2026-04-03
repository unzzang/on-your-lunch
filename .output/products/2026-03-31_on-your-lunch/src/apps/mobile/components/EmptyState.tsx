// ─────────────────────────────────────────
// 빈 상태 컴포넌트
//
// 데이터가 없을 때 표시하는 안내 UI.
// 아이콘 + 제목 + 설명 + 선택적 액션 버튼.
// ─────────────────────────────────────────

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/tokens';

interface EmptyStateProps {
  /** 상단 아이콘 (이모지 또는 텍스트) */
  icon: string;
  /** 메인 제목 */
  title: string;
  /** 보조 설명 */
  description?: string;
  /** 액션 버튼 라벨 */
  actionLabel?: string;
  /** 액션 버튼 콜백 */
  onAction?: () => void;
  /** 액션 버튼 스타일: primary(기본) 또는 secondary */
  actionVariant?: 'primary' | 'secondary';
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'primary',
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[
            styles.button,
            actionVariant === 'secondary' && styles.buttonSecondary,
          ]}
          onPress={onAction}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              actionVariant === 'secondary' && styles.buttonTextSecondary,
            ]}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: Spacing['5xl'],
    paddingHorizontal: Spacing.base,
  },
  icon: {
    fontSize: 48,
    marginBottom: Spacing.base,
    color: Colors.text.placeholder,
  },
  title: {
    ...Typography.body1,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body2,
    color: Colors.text.placeholder,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  buttonSecondary: {
    backgroundColor: Colors.bg.primary,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  buttonText: {
    ...Typography.body2,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  buttonTextSecondary: {
    color: Colors.text.primary,
  },
});
