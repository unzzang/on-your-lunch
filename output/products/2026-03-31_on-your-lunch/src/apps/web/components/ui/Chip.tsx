'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: ReactNode;
}

export default function Chip({
  active = false,
  icon,
  children,
  className = '',
  ...props
}: ChipProps) {
  return (
    <button
      className={`
        inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-full)]
        cursor-pointer px-4 py-2 text-[14px] font-medium leading-none transition-all duration-150
        ${
          active
            ? 'bg-primary text-text-inverse'
            : 'bg-bg-tertiary text-text-secondary hover:bg-border-default'
        }
        ${className}
      `}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
