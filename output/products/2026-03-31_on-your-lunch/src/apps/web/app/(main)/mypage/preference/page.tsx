'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CaretLeft, Check } from '@phosphor-icons/react';
import { Toast } from '@/components/ui';
import { useMe } from '@/hooks/useMe';
import { useCategories } from '@/hooks/useCategories';
import { useAllergyTypes } from '@/hooks/useAllergyTypes';
import { useUpdatePreferences } from '@/hooks';
import { PriceRange } from '@on-your-lunch/shared-types';

const PRICE_OPTIONS = [
  { value: PriceRange.UNDER_10K, label: '1만원 미만' },
  { value: PriceRange.BETWEEN_10K_20K, label: '1~2만원' },
  { value: PriceRange.OVER_20K, label: '2만원 이상' },
];

export default function PreferencePage() {
  const router = useRouter();
  const { data: me } = useMe();
  const { data: categories } = useCategories();
  const { data: allergyTypes } = useAllergyTypes();
  const updatePreferences = useUpdatePreferences();

  const [preferredIds, setPreferredIds] = useState<string[]>([]);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [allergyIds, setAllergyIds] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>(PriceRange.BETWEEN_10K_20K);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  /* 기존 설정 로드 */
  useEffect(() => {
    if (!me) return;
    setPreferredIds(me.preferences.preferredCategories.map((c) => c.id));
    setExcludedIds(me.preferences.excludedCategories.map((c) => c.id));
    setAllergyIds(me.preferences.allergies.map((a) => a.id));
    setPriceRange(me.preferences.preferredPriceRange as PriceRange);
  }, [me]);

  const toggleId = (list: string[], setList: (v: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences.mutateAsync({
        preferredCategoryIds: preferredIds,
        excludedCategoryIds: excludedIds,
        allergyTypeIds: allergyIds,
        preferredPriceRange: priceRange,
      });
      setToast('취향이 저장되었어요');
      setTimeout(() => router.back(), 1200);
    } catch {
      setToast('저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* 앱바 */}
      <div className="sticky top-0 z-10 flex h-14 items-center gap-2 bg-bg-primary px-4">
        <button onClick={() => router.back()}>
          <CaretLeft size={24} className="text-text-primary" />
        </button>
        <span className="text-lg font-bold text-text-primary">취향 설정</span>
      </div>

      <div className="flex flex-col gap-6 px-4 pb-24 pt-2">
        {/* 선호 카테고리 */}
        <section>
          <h3 className="mb-3 text-[15px] font-semibold text-text-primary">좋아하는 음식</h3>
          <div className="flex flex-wrap gap-2">
            {categories?.map((cat) => (
              <ChipToggle
                key={cat.id}
                label={cat.name}
                active={preferredIds.includes(cat.id)}
                color={cat.colorCode}
                onClick={() => toggleId(preferredIds, setPreferredIds, cat.id)}
              />
            ))}
          </div>
        </section>

        {/* 제외 카테고리 */}
        <section>
          <h3 className="mb-3 text-[15px] font-semibold text-text-primary">빼고 싶은 음식</h3>
          <div className="flex flex-wrap gap-2">
            {categories?.map((cat) => (
              <ChipToggle
                key={cat.id}
                label={cat.name}
                active={excludedIds.includes(cat.id)}
                color="#DC2626"
                onClick={() => toggleId(excludedIds, setExcludedIds, cat.id)}
              />
            ))}
          </div>
        </section>

        {/* 알레르기 */}
        <section>
          <h3 className="mb-3 text-[15px] font-semibold text-text-primary">알레르기</h3>
          <div className="flex flex-wrap gap-2">
            {allergyTypes?.map((allergy) => (
              <ChipToggle
                key={allergy.id}
                label={allergy.name}
                active={allergyIds.includes(allergy.id)}
                color="#F59E0B"
                onClick={() => toggleId(allergyIds, setAllergyIds, allergy.id)}
              />
            ))}
          </div>
        </section>

        {/* 가격대 */}
        <section>
          <h3 className="mb-3 text-[15px] font-semibold text-text-primary">선호 가격대</h3>
          <div className="flex gap-2">
            {PRICE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPriceRange(opt.value)}
                className={`flex-1 rounded-[var(--radius-md)] border py-3 text-sm font-medium transition-colors ${
                  priceRange === opt.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-default bg-bg-primary text-text-secondary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-primary px-4 pb-8 pt-3 shadow-[0_-4px_6px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleSave}
          disabled={saving || preferredIds.length === 0}
          className="h-12 w-full rounded-[var(--radius-md)] bg-primary text-[16px] font-semibold text-text-inverse transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-primary-disabled"
        >
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </div>

      <Toast message={toast} visible={!!toast} onClose={() => setToast('')} />
    </div>
  );
}

function ChipToggle({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-[var(--radius-full)] border px-3.5 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-transparent text-white'
          : 'border-border-default bg-bg-primary text-text-secondary'
      }`}
      style={active ? { backgroundColor: color } : undefined}
    >
      {active && <Check size={14} weight="bold" />}
      {label}
    </button>
  );
}
