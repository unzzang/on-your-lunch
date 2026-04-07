'use client';

import { useCategories } from '@/hooks';
import { useFilterStore } from '@/stores/filterStore';
import type { CategorySummary } from '@on-your-lunch/shared-types';

const WALK_OPTIONS = [
  { value: 5, label: '5분' },
  { value: 10, label: '10분' },
  { value: 15, label: '15분' },
];

const PRICE_OPTIONS = [
  { value: 'UNDER_10K', label: '~1만' },
  { value: 'BETWEEN_10K_20K', label: '1~2만' },
  { value: 'OVER_20K', label: '2만~' },
];

export default function FilterChips() {
  const { data: categories } = useCategories();
  const {
    selectedCategoryId,
    walkMinutes,
    priceRange,
    setCategory,
    setWalkMinutes,
    setPriceRange,
  } = useFilterStore();

  return (
    <div className="bg-bg-primary">
      {/* 카테고리 칩 */}
      <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-2 pt-3">
        <button
          onClick={() => setCategory(null)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 ${
            selectedCategoryId === null
              ? 'bg-primary text-text-inverse'
              : 'bg-bg-tertiary text-text-secondary hover:bg-border-default'
          }`}
        >
          전체
        </button>
        {categories?.map((cat: CategorySummary) => (
          <button
            key={cat.id}
            onClick={() =>
              setCategory(selectedCategoryId === cat.id ? null : cat.id)
            }
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 ${
              selectedCategoryId === cat.id
                ? 'bg-primary text-text-inverse'
                : 'bg-bg-tertiary text-text-secondary hover:bg-border-default'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 서브 필터 (도보 시간 + 가격대) */}
      <div className="flex gap-3 px-4 pb-3">
        {/* 도보 시간 세그먼트 */}
        <div className="flex rounded-[var(--radius-md)] bg-bg-tertiary p-0.5">
          {WALK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                setWalkMinutes(walkMinutes === opt.value ? null : opt.value)
              }
              className={`whitespace-nowrap rounded-[var(--radius-sm)] px-3 py-[6px] text-xs font-medium transition-all duration-150 ${
                walkMinutes === opt.value
                  ? 'bg-bg-primary text-primary shadow-sm'
                  : 'bg-transparent text-text-secondary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 가격대 세그먼트 */}
        <div className="flex rounded-[var(--radius-md)] bg-bg-tertiary p-0.5">
          {PRICE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                setPriceRange(priceRange === opt.value ? null : opt.value)
              }
              className={`whitespace-nowrap rounded-[var(--radius-sm)] px-3 py-[6px] text-xs font-medium transition-all duration-150 ${
                priceRange === opt.value
                  ? 'bg-bg-primary text-primary shadow-sm'
                  : 'bg-transparent text-text-secondary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
