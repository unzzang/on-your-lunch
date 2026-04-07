'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function LandingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) {
      if (user.isOnboardingCompleted) {
        router.replace('/home');
      } else {
        router.replace('/location');
      }
    } else {
      router.replace('/login');
    }
  }, [user, router]);

  // 리다이렉트 중 잠깐 표시되는 스플래시
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-[28px] font-bold text-primary">온유어런치</h1>
        <p className="text-sm text-text-secondary">오늘 점심, 뭐 먹을까요?</p>
      </div>
    </div>
  );
}
