'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 dark:border-emerald-950/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              Plantinia
            </span>
            <span className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold -mt-1">
              AI Plant Doctor
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Features
          </Link>
          <Link href="#demo" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            AI Scan Demo
          </Link>
          <Link href="#pricing" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Pricing
          </Link>
          <Link href="/knowledge" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Disease Library
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm shadow-emerald-600/30 hover:shadow-md transition-all active:scale-95"
          >
            <span>Start Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
