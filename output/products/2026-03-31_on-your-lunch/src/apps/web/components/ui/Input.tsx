'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            h-12 rounded-[var(--radius-md)] border px-4 text-[15px]
            text-text-primary outline-none transition-colors duration-150
            placeholder:text-text-placeholder
            ${
              error
                ? 'border-destructive focus:border-destructive'
                : 'border-border-default focus:border-2 focus:border-border-focus'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-xs text-destructive">{error}</span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
