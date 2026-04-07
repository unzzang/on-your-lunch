'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  visible,
  duration = 3000,
  onClose,
}: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-24 z-[500] flex justify-center px-4">
      <div className="rounded-[var(--radius-md)] bg-toast-bg px-5 py-3 text-sm text-text-inverse">
        {message}
      </div>
    </div>
  );
}
