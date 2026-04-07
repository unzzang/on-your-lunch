'use client';

import { useState } from 'react';
import { ForkKnife, Star, Trash } from '@phosphor-icons/react';
import type { CalendarRecord } from '@on-your-lunch/shared-types';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&h=300&fit=crop';

interface RecordCardProps {
  record: CalendarRecord;
  onClick?: () => void;
  onDelete?: (id: string) => void;
}

function renderStars(rating: number): string {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

export default function RecordCard({ record, onClick, onDelete }: RecordCardProps) {
  const [imgSrc, setImgSrc] = useState(record.restaurant.thumbnailUrl || '');
  const [imgError, setImgError] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(record.id);
    }
  };

  return (
    <div
      className="flex cursor-pointer gap-3 border-b border-border-default px-4 py-3 hover:bg-bg-secondary"
      onClick={onClick}
    >
      {/* 썸네일 또는 아이콘 박스 */}
      {imgSrc ? (
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[var(--radius-md)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={record.restaurant.name}
            className="h-full w-full object-cover"
            onError={() => {
              if (!imgError) {
                setImgSrc(FALLBACK_IMG);
                setImgError(true);
              }
            }}
          />
        </div>
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-bg-tertiary">
          <ForkKnife size={24} className="text-primary" />
        </div>
      )}
      {/* 정보 */}
      <div className="min-w-0 flex-1">
        <div className="text-base font-semibold text-text-primary">
          {record.restaurant.name}
        </div>
        <div className="mt-0.5 text-[13px] text-text-secondary">
          {record.category.name} ·{' '}
          <span className="text-rating">{renderStars(record.rating)}</span>{' '}
          {record.rating.toFixed(1)}
        </div>
        {record.memo && (
          <div className="mt-1 text-[13px] italic text-text-secondary">
            &ldquo;{record.memo}&rdquo;
          </div>
        )}
      </div>
      {/* 삭제 버튼 */}
      {onDelete && (
        <button
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-tertiary hover:text-destructive"
          onClick={handleDelete}
          aria-label="기록 삭제"
        >
          <Trash size={20} />
        </button>
      )}
    </div>
  );
}
