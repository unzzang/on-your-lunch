'use client';

import { WifiSlash } from '@phosphor-icons/react';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = '인터넷 연결을 확인해주세요',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <WifiSlash size={48} className="text-text-placeholder" />
      <p className="text-base text-text-secondary">{title}</p>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry} className="mt-2">
          다시 시도
        </Button>
      )}
    </div>
  );
}
