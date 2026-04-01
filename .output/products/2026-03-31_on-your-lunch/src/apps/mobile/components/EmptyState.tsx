import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, typography, spacing, radius } from '@/constants/tokens';
import type { IconProps } from 'phosphor-react-native';

interface EmptyStateProps {
  icon: React.ReactElement<IconProps>;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: 'primary' | 'secondary';
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  actionVariant = 'primary',
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <Pressable
          style={[
            styles.button,
            actionVariant === 'secondary' && styles.buttonSecondary,
          ]}
          onPress={onAction}
        >
          <Text
            style={[
              styles.buttonText,
              actionVariant === 'secondary' && styles.buttonTextSecondary,
            ]}
          >
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: spacing['5xl'],
    paddingHorizontal: spacing.base,
  },
  title: {
    fontSize: typography.body1.size,
    fontWeight: typography.body1.weight,
    lineHeight: typography.body1.lineHeight,
    color: colors.text.secondary,
    marginTop: spacing.base,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.body2.size,
    fontWeight: typography.body2.weight,
    lineHeight: typography.body2.lineHeight,
    color: colors.text.placeholder,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  buttonText: {
    fontSize: typography.body2.size,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  buttonTextSecondary: {
    color: colors.text.primary,
  },
});
