// ─────────────────────────────────────────
// 에러 상태 컴포넌트
//
// 네트워크/서버 에러 시 표시하는 안내 UI.
// 아이콘 + 메시지 + 다시 시도 버튼.
// ─────────────────────────────────────────

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/tokens';

interface ErrorStateProps {
  /** 에러 메시지 (기본: 인터넷 연결을 확인해주세요) */
  message?: string;
  /** 다시 시도 콜백 */
  onRetry?: () => void;
}

export default function ErrorState({
  message = '인터넷 연결을 확인해주세요',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{'📡'}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.button}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>다시 시도</Text>
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
  },
  message: {
    ...Typography.body1,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  buttonText: {
    ...Typography.body2,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});
