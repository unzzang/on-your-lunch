'use client';

import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import type { CalendarDay } from '@on-your-lunch/shared-types';

interface CalendarProps {
  year: number;
  month: number;
  days: CalendarDay[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 카테고리 colorCode → CSS dot 클래스 */
function getCategoryDotStyle(colorCode: string): string {
  return colorCode || '#9CA3AF';
}

export default function Calendar({
  year,
  month,
  days,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: CalendarProps) {
  const today = getToday();
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=일요일
  const daysInMonth = new Date(year, month, 0).getDate();

  /* 날짜별 기록 매핑 */
  const recordMap = new Map<string, CalendarDay>();
  days.forEach((d) => recordMap.set(d.date, d));

  /* 빈 셀 + 날짜 셀 */
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-bg-primary px-4 pb-4">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-center gap-5 py-3 pb-4">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-bg-tertiary"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onPrevMonth();
          }}
        >
          <CaretLeft size={20} className="text-text-primary" />
        </button>
        <span className="min-w-[140px] text-center text-lg font-semibold text-text-primary">
          {year}년 {month}월
        </span>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-bg-tertiary"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onNextMonth();
          }}
        >
          <CaretRight size={20} className="text-text-primary" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="mb-2 grid grid-cols-7 text-center">
        {WEEKDAYS.map((w, i) => (
          <span
            key={w}
            className={`py-2 text-xs font-medium ${
              i === 0 ? 'text-primary' : 'text-text-placeholder'
            }`}
          >
            {w}
          </span>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="min-h-[48px]" />;
          }

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const isSunday = idx % 7 === 0;
          const record = recordMap.get(dateStr);

          return (
            <div
              key={dateStr}
              className={`relative flex min-h-[48px] cursor-pointer flex-col items-center rounded-[var(--radius-md)] py-1.5 hover:bg-bg-secondary ${
                isSelected
                  ? 'border-2 border-primary bg-bg-secondary'
                  : ''
              }`}
              onClick={() => onSelectDate(dateStr)}
            >
              <span
                className={`text-sm ${
                  isToday
                    ? 'flex h-7 w-7 items-center justify-center rounded-full bg-primary font-semibold text-text-inverse'
                    : isSunday
                      ? 'font-normal text-primary'
                      : 'font-normal text-text-primary'
                }`}
              >
                {day}
              </span>
              {/* 카테고리 dots */}
              {record && record.records.length > 0 && (
                <div className="mt-1 flex gap-[3px]">
                  {record.records.slice(0, 3).map((r) => (
                    <span
                      key={r.id}
                      className="block h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: getCategoryDotStyle(r.category.colorCode),
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
