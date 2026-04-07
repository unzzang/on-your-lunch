'use client';

import { useRouter } from 'next/navigation';
import { CaretLeft, WifiSlash } from '@phosphor-icons/react';
import { useCategories } from '@/hooks';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { PriceRange } from '@on-your-lunch/shared-types';

function ProgressBar({ filled }: { filled: number }) {
  return (
    <div className="mb-6 flex gap-1">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full ${
            i <= filled ? 'bg-primary' : 'bg-bg-tertiary'
          }`}
        />
      ))}
    </div>
  );
}

const PRICE_OPTIONS = [
  { value: PriceRange.UNDER_10K, label: '1만원 이하' },
  { value: PriceRange.BETWEEN_10K_20K, label: '1~2만원' },
  { value: PriceRange.OVER_20K, label: '2만원 이상' },
];

export default function PreferencePage() {
  const router = useRouter();
  const store = useOnboardingStore();
  const { data: categories, isLoading, isError, refetch } = useCategories();

  const canProceed = store.preferredCategoryIds.length > 0;

  if (isError) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[393px] flex-col items-center justify-center gap-3 bg-bg-primary px-6 text-center">
        <WifiSlash size={48} className="text-text-placeholder" />
        <p className="text-[16px] text-text-secondary">데이터를 불러올 수 없어요</p>
        <button
          onClick={() => refetch()}
          className="mt-2 rounded-[var(--radius-md)] bg-primary px-6 py-3 text-sm font-semibold text-text-inverse"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 py-3 text-sm text-text-secondary"
      >
        <CaretLeft size={20} />
        뒤로
      </button>

      <ProgressBar filled={4} />

      <span className="mb-4 text-xs text-text-secondary">Step 2/3</span>
      <h2 className="text-[20px] font-bold leading-[30px] text-text-primary">
        어떤 음식을 좋아하세요?
      </h2>
      <p className="mt-2 text-sm text-text-secondary">1개 이상 선택해주세요.</p>

      {/* 카테고리 칩 */}
      <div className="mt-6 flex flex-wrap gap-2">
        {isLoading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-20 animate-pulse rounded-full bg-bg-tertiary"
              />
            ))
          : categories?.map((cat) => {
              const active = store.preferredCategoryIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => store.togglePreferredCategory(cat.id)}
                  className={`rounded-full px-5 py-[10px] text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'border border-primary bg-primary text-text-inverse'
                      : 'border border-border-default bg-bg-primary text-text-primary'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
      </div>

      {/* 구분선 */}
      <div className="my-6 h-px bg-border-default" />

      {/* 가격대 */}
      <div className="text-[16px] font-semibold text-text-primary">
        점심 예산은?
      </div>
      <div className="mt-3 flex gap-2">
        {PRICE_OPTIONS.map((opt) => {
          const active = store.preferredPriceRange === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => store.setPriceRange(opt.value)}
              className={`flex-1 rounded-[var(--radius-md)] border py-3 text-center text-sm font-medium transition-all duration-150 ${
                active
                  ? 'border-primary bg-primary text-text-inverse'
                  : 'border-border-default bg-bg-primary text-text-primary'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-[40px] flex-1" />

      <button
        onClick={() => router.push('/exclusion')}
        disabled={!canProceed}
        className="mb-10 h-12 w-full rounded-[var(--radius-md)] bg-primary text-[16px] font-semibold text-text-inverse transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-primary-disabled"
      >
        다음
      </button>
    </div>
  );
}
