'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  House,
  MagnifyingGlass,
  CalendarBlank,
  User,
} from '@phosphor-icons/react';

const tabs = [
  { href: '/home', label: '홈', Icon: House },
  { href: '/explore', label: '탐색', Icon: MagnifyingGlass },
  { href: '/history', label: '이력', Icon: CalendarBlank },
  { href: '/mypage', label: '마이', Icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-[100] w-full max-w-[393px] -translate-x-1/2 border-t border-border-default bg-bg-primary">
      <div className="flex justify-around px-6 pb-7 pt-2">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 no-underline"
            >
              <Icon
                size={24}
                weight={active ? 'fill' : 'regular'}
                className={active ? 'text-primary' : 'text-text-placeholder'}
              />
              <span
                className={`text-[11px] font-medium ${
                  active ? 'text-primary' : 'text-text-placeholder'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
