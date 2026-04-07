'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, CalendarBlank } from '@phosphor-icons/react';
import { ErrorState, EmptyState } from '@/components/ui';
import Skeleton from '@/components/ui/Skeleton';
import Calendar from '@/components/features/Calendar';
import RecordCard from '@/components/features/RecordCard';
import { useEatingHistory } from '@/hooks/useEatingHistory';
import { useDeleteEatingHistory } from '@/hooks';

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateLabel(dateStr: string): string {
  const today = getToday();
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const suffix = dateStr === today ? ' (오늘)' : '';
  return `${month}월 ${day}일${suffix}`;
}

export default function HistoryPage() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string>(getToday());

  const { data, isLoading, isError, refetch } = useEatingHistory(year, month);
  const deleteHistory = useDeleteEatingHistory();

  const handleDelete = (id: string) => {
    if (confirm('이 기록을 삭제할까요?')) {
      deleteHistory.mutate(id);
    }
  };

  /* 선택된 날짜의 기록 */
  const selectedRecords = useMemo(() => {
    if (!data) return [];
    const dayData = data.days.find((d) => d.date === selectedDate);
    return dayData?.records ?? [];
  }, [data, selectedDate]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* 앱바 */}
      <div className="flex h-14 items-center justify-between bg-bg-primary px-4">
        <span className="text-xl font-bold text-text-primary">먹은 이력</span>
        <button
          className="flex items-center gap-1 rounded-full bg-primary px-3.5 py-2 text-[13px] font-semibold text-text-inverse"
          onClick={() => {
            /* 기록 추가 플로우 — 식당 검색으로 이동 */
            router.push('/explore');
          }}
        >
          <Plus size={16} /> 기록
        </button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="flex flex-1 flex-col gap-3 p-4">
          <Skeleton className="h-[280px] !rounded-[var(--radius-lg)]" />
          <div className="flex gap-3 py-3">
            <Skeleton className="h-12 w-12 !rounded-[var(--radius-md)]" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-[60%]" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
          </div>
          <div className="flex gap-3 py-3">
            <Skeleton className="h-12 w-12 !rounded-[var(--radius-md)]" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-[60%]" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 캘린더 */}
          <Calendar
            year={year}
            month={month}
            days={data?.days ?? []}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          {/* 구분선 */}
          <div className="h-2 bg-bg-secondary" />

          {/* 기록 리스트 */}
          <div className="flex-1">
            <div className="px-4 py-4 text-base font-semibold text-text-primary">
              {formatDateLabel(selectedDate)}
            </div>

            {selectedRecords.length === 0 ? (
              <EmptyState
                icon={<CalendarBlank size={48} />}
                title="아직 기록이 없어요"
                subtitle="점심 먹은 후 기록해보세요!"
                actionLabel="기록하러 가기"
                actionVariant="primary"
                onAction={() => router.push('/explore')}
              />
            ) : (
              selectedRecords.map((record) => (
                <RecordCard
                  key={record.id}
                  record={record}
                  onClick={() =>
                    router.push(`/restaurant/${record.restaurant.id}`)
                  }
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
