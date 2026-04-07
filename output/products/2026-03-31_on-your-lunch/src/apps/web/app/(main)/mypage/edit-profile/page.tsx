'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaretLeft, User } from '@phosphor-icons/react';
import { useMe } from '@/hooks/useMe';
import { useUpdateProfile } from '@/hooks/useMutations';

export default function EditProfilePage() {
  const router = useRouter();
  const { data: me } = useMe();
  const updateProfile = useUpdateProfile();

  const [nickname, setNickname] = useState(me?.nickname ?? '');
  const isDirty = nickname !== (me?.nickname ?? '');

  const handleSave = async () => {
    if (!isDirty) return;
    await updateProfile.mutateAsync({ nickname });
    router.push('/mypage');
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
          프로필 편집
        </span>
        <button
          className={`text-[15px] font-semibold ${
            isDirty ? 'text-primary' : 'text-primary-disabled'
          }`}
          disabled={!isDirty || updateProfile.isPending}
          onClick={handleSave}
        >
          저장
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 px-4 pt-6">
        {/* 아바타 */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bg-tertiary">
            <User size={36} className="text-text-placeholder" />
          </div>
          <span className="cursor-pointer text-sm font-medium text-primary">
            사진 변경
          </span>
        </div>

        {/* 닉네임 */}
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            닉네임
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="h-12 w-full rounded-[var(--radius-md)] border border-border-default px-4 text-[15px] text-text-primary outline-none focus:border-primary"
          />
          <span className="mt-1 block text-xs text-text-placeholder">
            2~10자, 한글/영문/숫자
          </span>
        </div>

        {/* 이메일 (읽기전용) */}
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            이메일
          </label>
          <input
            type="text"
            value={me?.email ?? ''}
            disabled
            className="h-12 w-full cursor-not-allowed rounded-[var(--radius-md)] border border-border-default bg-bg-tertiary px-4 text-[15px] text-text-placeholder outline-none"
          />
          <span className="mt-1 block text-xs text-text-placeholder">
            Google 계정 이메일 (변경 불가)
          </span>
        </div>
      </div>
    </div>
  );
}
