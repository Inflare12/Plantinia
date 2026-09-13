'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Flower2, ScanLine, History, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileTabBar() {
  const pathname = usePathname();
  const tabs = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Garden', href: '/plants', icon: Flower2 },
    { label: 'Scan', href: '/diagnose', icon: ScanLine, isCenter: true },
    { label: 'History', href: '/history', icon: History },
    { label: 'Account', href: '/profile', icon: User },
  ];

  return <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-slate-200/80 dark:border-[#1e2a24] safe-bottom bg-white/95 dark:bg-[#0c120f]/95 shadow-lg">
    <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        if (tab.isCenter) return <Link key={tab.href} href={tab.href} className="relative -top-5 flex flex-col items-center group" aria-label="Scan Plant">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 group-active:scale-95 group-hover:scale-105 transition-all ring-4 ring-white dark:ring-[#0c120f]"><Icon className="w-7 h-7 animate-pulse-subtle" /></div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">AI Scan</span>
        </Link>;
        return <Link key={tab.href} href={tab.href} className={cn('flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all', isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300')}>
          <Icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} /><span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
        </Link>;
      })}
    </div>
  </nav>;
}
