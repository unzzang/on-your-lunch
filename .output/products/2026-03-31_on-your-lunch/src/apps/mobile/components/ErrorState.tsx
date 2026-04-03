import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typo, spacing, radius } from '../constants/tokens';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = '인터넷 연결을 확인해주세요',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="wifi-outline" size={48} color={colors.text.placeholder} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>다시 시도</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
    gap: spacing.md,
  },
  message: {
    ...typo.body1,
    color: colors.text.secondary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  buttonText: {
    ...typo.body2,
    fontWeight: '700',
    color: colors.text.inverse,
  },
});
