import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typo, spacing } from '../constants/tokens';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  subtitle?: string;
}

export default function EmptyState({
  icon = 'restaurant-outline',
  title = '데이터가 없어요',
  subtitle,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={48} color={colors.text.placeholder} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
    gap: spacing.sm,
  },
  title: {
    ...typo.body1,
    color: colors.text.secondary,
  },
  subtitle: {
    ...typo.body2,
    color: colors.text.placeholder,
  },
});
