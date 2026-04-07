'use client';

import { Bell } from '@phosphor-icons/react';

export default function AppBar() {
  return (
    <header className="flex h-14 items-center justify-between bg-bg-primary px-4">
      <span className="text-[20px] font-bold text-primary">온유어런치</span>
      <button className="flex h-11 w-11 items-center justify-center">
        <Bell size={24} className="text-text-secondary" />
      </button>
    </header>
  );
}
