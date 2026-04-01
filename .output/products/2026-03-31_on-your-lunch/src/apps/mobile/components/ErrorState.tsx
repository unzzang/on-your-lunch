import React from 'react';
import { WifiSlash } from 'phosphor-react-native';
import { colors } from '@/constants/tokens';
import EmptyState from './EmptyState';

interface ErrorStateProps {
  onRetry: () => void;
}

export default function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <EmptyState
      icon={<WifiSlash size={48} color={colors.text.placeholder} weight="light" />}
      title="인터넷 연결을 확인해주세요"
      actionLabel="다시 시도"
      onAction={onRetry}
    />
  );
}
