'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ForkKnife,
  UsersThree,
  WifiSlash,
} from '@phosphor-icons/react';
import { useDevLogin } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';

type Screen = 'splash' | 'intro' | 'error';

export default function LoginPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>('splash');
  const [loading, setLoading] = useState(false);
  const devLogin = useDevLogin();
  const user = useAuthStore((s) => s.user);

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (user) {
      if (user.isOnboardingCompleted) {
        router.replace('/home');
      } else {
        router.replace('/location');
      }
    }
  }, [user, router]);

  // 스플래시 1.5초 후 인트로로 전환
  useEffect(() => {
    const timer = setTimeout(() => {
      setScreen('intro');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await devLogin.mutateAsync();
      // onSuccess에서 setAuth가 호출되고, useEffect에서 리다이렉트
    } catch {
      setScreen('error');
      setLoading(false);
    }
  };

  // 스플래시 화면
  if (screen === 'splash') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <span className="text-[32px] font-bold text-primary">온유어런치</span>
        <span className="text-[16px] text-text-secondary">매일 점심, 고민 끝.</span>
      </div>
    );
  }

  // 에러 화면
  if (screen === 'error') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <WifiSlash size={48} className="text-text-placeholder" />
        <p className="text-[16px] text-text-secondary">인터넷 연결을 확인해주세요</p>
        <button
          onClick={() => {
            setScreen('intro');
          }}
          className="mt-2 rounded-[var(--radius-md)] bg-primary px-6 py-3 text-sm font-semibold text-text-inverse"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 인트로/로그인 화면
  return (
    <div className="flex flex-1 flex-col px-6">
      {/* 일러스트 */}
      <div className="mt-10 flex h-[300px] flex-col items-center justify-center gap-2">
        <ForkKnife size={80} weight="regular" className="text-primary opacity-70" />
        <UsersThree size={60} weight="regular" className="text-primary opacity-50" />
        <span className="text-[14px] text-text-placeholder">점심 고민하는 직장인들</span>
      </div>

      {/* 타이틀 */}
      <h1 className="mt-6 text-center text-[24px] font-bold leading-[34px] text-text-primary">
        매일 점심 뭐 먹지?
        <br />
        온유어런치가 골라줄게요!
      </h1>
      <p className="mt-2 text-center text-[16px] text-text-secondary">
        회사 근처 맛집, 3초만에 추천
      </p>

      <div className="flex-1" />

      {/* Google 로그인 버튼 (dev-login 사용) */}
      <button
        onClick={handleLogin}
        disabled={loading}
        className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-[var(--radius-md)] border border-border-default bg-bg-primary text-[16px] font-medium text-text-primary shadow-sm transition-colors hover:bg-bg-tertiary disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-text-primary border-t-transparent" />
        ) : (
          <>
            <GoogleIcon />
            Google로 시작하기
          </>
        )}
      </button>

      {/* 약관 안내 */}
      <p className="mb-10 mt-4 text-center text-[12px] text-text-placeholder">
        계속하면{' '}
        <span className="text-text-secondary underline">이용약관</span>에
        동의하게 됩니다
      </p>

      {/* 로딩 오버레이 */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white/80">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-bg-tertiary border-t-primary" />
          <span className="text-sm text-text-secondary">로그인 중이에요...</span>
        </div>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
