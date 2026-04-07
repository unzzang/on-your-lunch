'use client';

import { ReactNode } from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon: ReactNode;
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
  actionVariant = 'secondary',
}: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <span className="text-5xl text-text-placeholder">{icon}</span>
      <p className="text-base leading-6 text-text-secondary">{title}</p>
      {subtitle && (
        <p className="text-sm text-text-placeholder">{subtitle}</p>
      )}
      {actionLabel && onAction && (
        <Button
          variant={actionVariant}
          size="sm"
          onClick={onAction}
          className="mt-2"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
