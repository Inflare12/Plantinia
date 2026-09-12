'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Sparkles,
  Camera,
  LogOut,
  User,
  ShieldAlert,
  Moon,
  Sun,
  Menu,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export function TopHeader({ user, onToggleMobileMenu }: { user?: any; onToggleMobileMenu?: () => void }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      apiClient.auth.getMe().then((res) => {
        if (res.user) setCurrentUser(res.user);
      }).catch(() => {});
    }

    if (typeof window !== 'undefined') {
      const darkPref = localStorage.getItem('plantinia_theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(darkPref);
      if (darkPref) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [currentUser]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('plantinia_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('plantinia_theme', 'light');
    }
  };

  const handleLogout = async () => {
    await apiClient.auth.logout();
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-[#1e2a24] bg-white/80 dark:bg-[#0c120f]/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#18221e]"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>AI Neural Engine Ready</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Credits Badge */}
        {currentUser && (
          <Link
            href="/billing"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:scale-105 transition-transform"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {currentUser.subscriptionTier === 'pro' || currentUser.subscriptionTier === 'farm'
                ? 'Unlimited AI'
                : `${currentUser.creditsRemaining ?? 5} Scans Left`}
            </span>
          </Link>
        )}

        {/* Quick Scan Action */}
        <Link
          href="/diagnose"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/30 transition-all active:scale-95"
        >
          <Camera className="w-4 h-4" />
          <span className="hidden xs:inline">Scan Plant</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#18221e] transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile / Logout */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <Link href="/profile" className="flex items-center gap-2 group">
              <img
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.email}`}
                alt={currentUser.name || 'User'}
                className="w-8 h-8 rounded-xl object-cover ring-2 ring-emerald-500/30 group-hover:ring-emerald-500 transition-all"
              />
              <span className="hidden md:inline text-xs font-medium text-slate-700 dark:text-slate-200">
                {currentUser.name}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
