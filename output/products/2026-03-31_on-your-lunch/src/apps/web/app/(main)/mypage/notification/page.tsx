'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CaretLeft, Lightbulb } from '@phosphor-icons/react';
import { useMe } from '@/hooks/useMe';
import { useUpdateNotification } from '@/hooks/useMutations';

const TIME_OPTIONS = [
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
];

export default function NotificationPage() {
  const router = useRouter();
  const { data: me } = useMe();
  const updateNotification = useUpdateNotification();

  const [enabled, setEnabled] = useState(true);
  const [time, setTime] = useState('11:30');

  useEffect(() => {
    if (me?.notification) {
      setEnabled(me.notification.enabled);
      setTime(me.notification.time);
    }
  }, [me]);

  const handleToggle = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    updateNotification.mutate({ enabled: newEnabled, time });
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    updateNotification.mutate({ enabled, time: newTime });
  };

  return (
    <div className="flex flex-1 flex-col bg-bg-primary">
      {/* 상단 바 */}
      <div className="flex h-14 items-center justify-between border-b border-border-default px-4">
        <button
          className="flex items-center gap-1 text-sm text-text-secondary"
          onClick={() => router.back()}
        >
          <CaretLeft size={20} /> 뒤로
        </button>
        <span className="text-[17px] font-semibold text-text-primary">
          알림 설정
        </span>
        <span />
      </div>

      {/* 콘텐츠 */}
      <div className="px-4 pt-4">
        {/* 토글 */}
        <div className="flex items-center justify-between py-4">
          <span className="text-base font-medium text-text-primary">
            점심 추천 알림
          </span>
          <button
            className={`relative h-7 w-12 rounded-[14px] transition-colors ${
              enabled ? 'bg-primary' : 'bg-border-default'
            }`}
            onClick={handleToggle}
          >
            <div
              className={`absolute top-[2px] h-6 w-6 rounded-full bg-white shadow-sm transition-[left] ${
                enabled ? 'left-[22px]' : 'left-[2px]'
              }`}
            />
          </button>
        </div>

        {/* 시간 선택 */}
        <div className="mt-2">
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            알림 시간
          </label>
          <select
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="h-12 w-full appearance-none rounded-[var(--radius-md)] border border-border-default bg-bg-primary px-4 text-[15px] text-text-primary outline-none"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-text-placeholder">
            10:00~13:00, 30분 단위
          </span>
        </div>

        {/* 힌트 */}
        <div className="mt-5 flex items-start gap-2 rounded-[var(--radius-md)] bg-bg-secondary p-3">
          <Lightbulb
            size={18}
            className="mt-0.5 shrink-0 text-primary"
          />
          <span className="text-[13px] leading-[18px] text-text-secondary">
            매일 설정한 시간에 오늘의 점심 추천을 알려드려요.
          </span>
        </div>
      </div>
    </div>
  );
}
