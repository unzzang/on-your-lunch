'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaretLeft, WifiSlash } from '@phosphor-icons/react';
import { useCategories, useAllergyTypes, useUpdatePreferences, useCompleteOnboarding } from '@/hooks';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import type { PriceRange } from '@on-your-lunch/shared-types';

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

export default function ExclusionPage() {
  const router = useRouter();
  const store = useOnboardingStore();
  const updatePreferences = useUpdatePreferences();
  const completeOnboarding = useCompleteOnboarding();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: allergyTypes, isLoading: allergyLoading } = useAllergyTypes();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const handleComplete = async () => {
    setSaving(true);
    setError(false);
    try {
      await updatePreferences.mutateAsync({
        preferredCategoryIds: store.preferredCategoryIds,
        excludedCategoryIds: store.excludedCategoryIds,
        allergyTypeIds: store.allergyTypeIds,
        preferredPriceRange: store.preferredPriceRange as PriceRange,
      });

      // 백엔드 온보딩 완료 처리
      await completeOnboarding.mutateAsync();

      // 프론트 상태 동기화
      if (user) {
        setUser({ ...user, isOnboardingCompleted: true });
      }

      store.reset();
      router.replace('/home');
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[393px] flex-col items-center justify-center gap-3 bg-bg-primary px-6 text-center">
        <WifiSlash size={48} className="text-text-placeholder" />
        <p className="text-[16px] text-text-secondary">저장에 실패했어요</p>
        <button
          onClick={() => setError(false)}
          className="mt-2 rounded-[var(--radius-md)] bg-primary px-6 py-3 text-sm font-semibold text-text-inverse"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const isLoading = catLoading || allergyLoading;

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

      <ProgressBar filled={6} />

      <span className="mb-4 text-xs text-text-secondary">Step 3/3</span>
      <h2 className="text-[20px] font-bold leading-[30px] text-text-primary">
        빼고 싶은 음식이 있나요?
      </h2>
      <p className="mt-2 text-sm text-text-secondary">
        없으면 건너뛰어도 돼요!
      </p>

      {/* 알레르기 */}
      <div className="mt-6">
        <div className="mb-[10px] text-sm font-semibold text-text-secondary">
          알레르기
        </div>
        <div className="flex flex-wrap gap-2">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-16 animate-pulse rounded-full bg-bg-tertiary"
                />
              ))
            : allergyTypes?.map((allergy) => {
                const active = store.allergyTypeIds.includes(allergy.id);
                return (
                  <button
                    key={allergy.id}
                    onClick={() => store.toggleAllergy(allergy.id)}
                    className={`rounded-full px-5 py-[10px] text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'border border-primary bg-primary text-text-inverse'
                        : 'border border-border-default bg-bg-primary text-text-primary'
                    }`}
                  >
                    {allergy.name}
                  </button>
                );
              })}
        </div>
      </div>

      {/* 싫어하는 음식 */}
      <div className="mt-6">
        <div className="mb-[10px] text-sm font-semibold text-text-secondary">
          싫어하는 음식
        </div>
        <div className="flex flex-wrap gap-2">
          {isLoading
            ? Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-20 animate-pulse rounded-full bg-bg-tertiary"
                />
              ))
            : categories?.map((cat) => {
                const active = store.excludedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => store.toggleExcludedCategory(cat.id)}
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
      </div>

      <div className="min-h-[24px] flex-1" />

      {/* 건너뛰기 */}
      <button
        onClick={handleComplete}
        className="py-3 text-center text-sm text-text-secondary underline"
      >
        건너뛰기
      </button>

      {/* 완료 버튼 */}
      <button
        onClick={handleComplete}
        disabled={saving}
        className="mb-10 mt-3 h-12 w-full rounded-[var(--radius-md)] bg-primary text-[16px] font-semibold text-text-inverse transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-primary-disabled"
      >
        {saving ? (
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-text-inverse border-t-transparent" />
        ) : (
          '완료!'
        )}
      </button>
    </div>
  );
}
