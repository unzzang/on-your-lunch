'use client';

import { useRouter } from 'next/navigation';
import { CaretLeft, Warning } from '@phosphor-icons/react';
import { useWithdraw } from '@/hooks/useMutations';
import { useAuthStore } from '@/stores/authStore';

export default function WithdrawPage() {
  const router = useRouter();
  const withdraw = useWithdraw();
  const logout = useAuthStore((s) => s.logout);

  const handleWithdraw = async () => {
    if (!confirm('정말 탈퇴하시겠어요? 이 작업은 되돌릴 수 없습니다.')) return;
    await withdraw.mutateAsync();
    logout();
    router.push('/login');
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
          회원 탈퇴
        </span>
        <span />
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 px-4 pt-6">
        <div className="py-6 text-center">
          <Warning size={48} className="mx-auto text-destructive" />
        </div>

        <h3 className="mb-4 text-center text-lg font-semibold text-text-primary">
          정말 탈퇴하시겠어요?
        </h3>

        <div className="mb-6 rounded-[var(--radius-lg)] bg-bg-secondary p-4">
          <p className="mb-2 text-sm leading-[22px] text-text-secondary">
            탈퇴하면 아래 데이터가 영구 삭제돼요.
          </p>
          <ul className="list-disc pl-5 text-sm leading-6 text-text-primary">
            <li>먹은 이력 및 별점 기록</li>
            <li>즐겨찾기 목록</li>
            <li>취향 설정 및 프로필 정보</li>
          </ul>
          <p className="mt-2 text-[13px] text-text-placeholder">
            삭제된 데이터는 복구할 수 없어요.
          </p>
        </div>

        <button
          className="h-12 w-full rounded-[var(--radius-md)] bg-destructive text-base font-semibold text-text-inverse"
          onClick={handleWithdraw}
          disabled={withdraw.isPending}
        >
          {withdraw.isPending ? '처리 중...' : '탈퇴하기'}
        </button>

        <button
          className="mt-2 h-12 w-full rounded-[var(--radius-md)] text-sm text-text-secondary"
          onClick={() => router.back()}
        >
          취소
        </button>
      </div>
    </div>
  );
}
