'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sprout, LayoutDashboard, ScanLine, Flower2, MessageSquareText,
  CalendarCheck, CloudSun, BookOpen, FileText, CreditCard, History, ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem { label: string; href: string; icon: React.ElementType; badge?: string; adminOnly?: boolean; }

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Garden', href: '/plants', icon: Flower2 },
  { label: 'AI Diagnosis', href: '/diagnose', icon: ScanLine, badge: 'AI' },
  { label: 'Scan History', href: '/history', icon: History },
  { label: 'AI Doctor Chat', href: '/chat', icon: MessageSquareText },
  { label: 'Care Schedule', href: '/care-plans', icon: CalendarCheck },
  { label: 'Weather Agronomy', href: '/weather', icon: CloudSun },
  { label: 'Plant Library', href: '/knowledge', icon: BookOpen },
  { label: 'Health Reports', href: '/reports', icon: FileText },
  { label: 'Plans & Billing', href: '/billing', icon: CreditCard },
  { label: 'Admin & ML Hub', href: '/admin', icon: ShieldAlert, adminOnly: true },
];

export function Sidebar({ userRole = 'user' }: { userRole?: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 border-r border-slate-200 dark:border-[#1e2a24] bg-white dark:bg-[#0c120f] h-screen sticky top-0 shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-[#1e2a24]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20"><Sprout className="w-5 h-5" /></div>
          <div><span className="font-bold text-lg text-slate-900 dark:text-white">Plantinia</span><span className="block text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold -mt-0.5">Plant Doctor AI</span></div>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.filter((item) => !item.adminOnly || userRole === 'admin').map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return <Link key={item.href} href={item.href} className={cn('flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group', isActive ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#151e19] hover:text-slate-900 dark:hover:text-slate-200')}>
            <div className="flex items-center gap-3"><Icon className={cn('w-4.5 h-4.5 transition-colors', isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600')} /><span>{item.label}</span></div>
            {item.badge && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">{item.badge}</span>}
          </Link>;
        })}
      </div>
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white border border-emerald-800/40">
        <div className="flex items-center gap-2 mb-1.5"><span className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">Pro Gardener</span></div>
        <p className="text-xs text-emerald-100/80 leading-relaxed mb-3">Get instant 24/7 video scans, custom recipes, and weather frost alerts.</p>
        <Link href="/billing" className="block w-full py-1.5 text-center text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm">Upgrade for ₹399</Link>
      </div>
    </aside>
  );
}
