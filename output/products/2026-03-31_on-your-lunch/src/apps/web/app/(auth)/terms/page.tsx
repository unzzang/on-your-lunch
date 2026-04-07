'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaretRight } from '@phosphor-icons/react';

interface TermItem {
  id: string;
  label: string;
  required: boolean;
}

const TERMS: TermItem[] = [
  { id: 'service', label: '서비스 이용약관', required: true },
  { id: 'privacy', label: '개인정보 처리방침', required: true },
  { id: 'location', label: '위치정보 이용약관', required: true },
  { id: 'marketing', label: '마케팅 수신 동의', required: false },
];

export default function TermsPage() {
  const router = useRouter();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const allChecked = TERMS.every((t) => checked.has(t.id));
  const requiredChecked = TERMS.filter((t) => t.required).every((t) =>
    checked.has(t.id),
  );

  const toggleAll = () => {
    if (allChecked) {
      setChecked(new Set());
    } else {
      setChecked(new Set(TERMS.map((t) => t.id)));
    }
  };

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNext = () => {
    if (!requiredChecked) return;
    router.push('/location');
  };

  return (
    <div className="flex flex-1 flex-col px-6">
      <h2 className="py-4 text-[20px] font-bold text-text-primary">약관 동의</h2>

      {/* 전체 동의 */}
      <button
        onClick={toggleAll}
        className="flex items-center gap-3 border-b border-border-default py-4"
      >
        <Checkbox checked={allChecked} />
        <span className="text-[18px] font-semibold text-text-primary">전체 동의</span>
      </button>

      {/* 개별 항목 */}
      {TERMS.map((term) => (
        <button
          key={term.id}
          onClick={() => toggle(term.id)}
          className="flex items-center gap-3 py-[14px]"
        >
          <Checkbox checked={checked.has(term.id)} />
          <span className="flex-1 text-left text-sm text-text-primary">
            {term.label}{' '}
            <span className="text-xs text-text-secondary">
              ({term.required ? '필수' : '선택'})
            </span>
          </span>
          <CaretRight size={20} className="text-text-placeholder" />
        </button>
      ))}

      <div className="flex-1" />

      <button
        onClick={handleNext}
        disabled={!requiredChecked}
        className="mb-10 h-12 w-full rounded-[var(--radius-md)] bg-primary text-[16px] font-semibold text-text-inverse transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-primary-disabled"
      >
        동의하고 시작하기
      </button>
    </div>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border-2 transition-all duration-150 ${
        checked
          ? 'border-primary bg-primary'
          : 'border-border-default bg-bg-primary'
      }`}
    >
      {checked && (
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
          <path
            d="M1 5L4.5 8.5L11 1.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
