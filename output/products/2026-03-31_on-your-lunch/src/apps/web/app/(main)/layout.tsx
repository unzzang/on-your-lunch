'use client';

import { usePathname } from 'next/navigation';
import BottomNav from '@/components/layout/BottomNav';

/** 탭바 숨김 경로 (식당 상세) */
const HIDE_TAB_PATHS = ['/restaurant/'];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideTab = HIDE_TAB_PATHS.some((p) => pathname.startsWith(p));

  return (
    <div className="relative mx-auto flex h-screen max-w-[393px] flex-col bg-bg-secondary">
      <div className={`flex flex-1 flex-col overflow-y-auto ${!hideTab ? 'pb-20' : ''}`}>{children}</div>
      {!hideTab && <BottomNav />}
    </div>
  );
}
