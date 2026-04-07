'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  CaretRight,
  MapPin,
  ForkKnife,
  Bell,
  FileText,
  Lock,
} from '@phosphor-icons/react';
import { Modal, ErrorState } from '@/components/ui';
import Skeleton from '@/components/ui/Skeleton';
import { useMe } from '@/hooks/useMe';
import { useAuthStore } from '@/stores/authStore';

export default function MyPage() {
  const router = useRouter();
  const { data: me, isLoading, isError, refetch } = useMe();
  const logout = useAuthStore((s) => s.logout);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (isError) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex h-14 items-center bg-bg-primary px-4">
          <span className="text-xl font-bold text-text-primary">마이페이지</span>
        </div>
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col bg-bg-secondary">
        <div className="flex h-14 items-center bg-bg-primary px-4">
          <span className="text-xl font-bold text-text-primary">마이페이지</span>
        </div>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-4 py-4">
            <Skeleton className="h-14 w-14 !rounded-full" />
            <div className="flex-1">
              <Skeleton className="mb-2 h-[18px] w-[40%]" />
              <Skeleton className="h-[14px] w-[60%]" />
            </div>
          </div>
          <Skeleton className="h-[1px] w-full" />
          <Skeleton className="h-12 w-full !rounded-[var(--radius-md)]" />
          <Skeleton className="h-12 w-full !rounded-[var(--radius-md)]" />
          <Skeleton className="h-12 w-full !rounded-[var(--radius-md)]" />
          <Skeleton className="mt-2 h-[1px] w-full" />
          <Skeleton className="h-12 w-full !rounded-[var(--radius-md)]" />
          <Skeleton className="h-12 w-full !rounded-[var(--radius-md)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-bg-secondary">
      {/* 앱바 */}
      <div className="flex h-14 items-center bg-bg-primary px-4">
        <span className="text-xl font-bold text-text-primary">마이페이지</span>
      </div>

      {/* 프로필 */}
      <div
        className="flex cursor-pointer items-center gap-4 bg-bg-primary px-4 py-5"
        onClick={() => router.push('/mypage/edit-profile')}
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg-tertiary">
          <User size={28} className="text-text-placeholder" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold text-text-primary">
            {me?.nickname ?? '사용자'}
          </div>
          <div className="mt-0.5 text-[13px] text-text-secondary">
            {me?.email ?? ''}
          </div>
        </div>
        <CaretRight size={20} className="text-text-placeholder" />
      </div>

      {/* 구분선 */}
      <div className="h-2 bg-bg-secondary" />

      {/* 설정 */}
      <div className="bg-bg-primary">
        <div className="px-4 pb-2 pt-4 text-[13px] font-semibold tracking-wide text-text-secondary">
          설정
        </div>
        <MenuItem icon={<MapPin size={20} />} label="회사 위치 변경" onClick={() => router.push('/mypage/location')} />
        <MenuItem icon={<ForkKnife size={20} />} label="취향 설정" onClick={() => router.push('/mypage/preference')} />
        <MenuItem
          icon={<Bell size={20} />}
          label="알림 설정"
          onClick={() => router.push('/mypage/notification')}
        />
      </div>

      <div className="h-2 bg-bg-secondary" />

      {/* 정보 */}
      <div className="bg-bg-primary">
        <div className="px-4 pb-2 pt-4 text-[13px] font-semibold tracking-wide text-text-secondary">
          정보
        </div>
        <MenuItem icon={<FileText size={20} />} label="서비스 이용약관" onClick={() => router.push('/terms')} />
        <MenuItem icon={<Lock size={20} />} label="개인정보 처리방침" onClick={() => router.push('/terms')} />
      </div>

      <div className="h-2 bg-bg-secondary" />

      {/* 로그아웃 / 탈퇴 */}
      <div className="bg-bg-primary px-4 pb-4 pt-2">
        <button
          className="block w-full py-3 text-left text-sm text-text-secondary"
          onClick={() => setShowLogoutModal(true)}
        >
          로그아웃
        </button>
        <button
          className="block w-full py-3 text-left text-sm text-destructive"
          onClick={() => router.push('/mypage/withdraw')}
        >
          회원 탈퇴
        </button>
      </div>

      <div className="py-4 text-center text-xs text-text-placeholder">
        앱 버전 1.0.0
      </div>

      {/* 로그아웃 모달 */}
      <Modal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      >
        <p className="mb-5 text-center text-lg font-semibold text-text-primary">
          로그아웃 하시겠어요?
        </p>
        <div className="flex gap-2">
          <button
            className="flex-1 rounded-[var(--radius-md)] bg-bg-tertiary py-3 text-[15px] font-semibold text-text-primary"
            onClick={() => setShowLogoutModal(false)}
          >
            취소
          </button>
          <button
            className="flex-1 rounded-[var(--radius-md)] bg-destructive py-3 text-[15px] font-semibold text-text-inverse"
            onClick={() => {
              logout();
              router.push('/login');
            }}
          >
            로그아웃
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* 메뉴 아이템 */
function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <div
      className="flex cursor-pointer items-center gap-3 border-b border-border-default px-4 py-3.5 last:border-b-0 hover:bg-bg-secondary"
      onClick={onClick}
    >
      <span className="text-text-secondary">{icon}</span>
      <span className="flex-1 text-[15px] text-text-primary">{label}</span>
      <CaretRight size={18} className="text-text-placeholder" />
    </div>
  );
}
