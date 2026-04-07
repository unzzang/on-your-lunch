'use client';

import { ReactNode, useEffect } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  /* 열렸을 때 body 스크롤 잠금 */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 z-[300] bg-overlay"
        onClick={onClose}
      />

      {/* 시트 */}
      <div className="fixed inset-x-0 bottom-0 z-[400] rounded-t-[var(--radius-xl)] bg-bg-primary px-6 pb-10 pt-3 shadow-lg">
        {/* 핸들 */}
        <div className="mx-auto mb-5 h-1 w-8 rounded-full bg-border-default" />

        {title && (
          <h3 className="mb-5 text-lg font-semibold text-text-primary">
            {title}
          </h3>
        )}

        {children}
      </div>
    </>
  );
}
