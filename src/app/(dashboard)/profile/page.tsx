'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Key,
  ShieldCheck,
  Copy,
  Check,
  LogOut,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiClient.auth.getMe().then((res) => setUser(res.user)).catch(console.error);
  }, []);

  const handleCopyApiKey = () => {
    if (user?.apiKey) {
      navigator.clipboard.writeText(user.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await apiClient.auth.logout();
    router.push('/login');
  };

  if (!user) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading user profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Gardener Profile & API Keys
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account credentials, developer API keys, and device sync.
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] shadow-xs space-y-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/40"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h2>
              {user.isEmailVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{user.email}</p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                {user.subscriptionTier} Plan
              </span>
              <span className="text-[10px] text-slate-400">Role: {user.role}</span>
            </div>
          </div>
        </div>

        {/* Developer API Key */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Key className="w-4 h-4 text-emerald-500" />
              REST API Key (Commercial & Automated Scanning)
            </span>
            <span className="text-[10px] text-slate-400">Bearer Authentication</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={user.apiKey || 'plnt_live_8f3910cbe4a991820'}
              className="flex-1 font-mono text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-slate-600 dark:text-slate-300"
            />
            <button
              onClick={handleCopyApiKey}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Use this key in the <code className="text-emerald-600">x-api-key</code> HTTP header for automated greenhouse sensor pipelines.
          </p>
        </div>

        {/* Android / Capacitor Sync Info */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#16201a]">
          <Smartphone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">Mobile Android Container</h4>
            <p className="text-slate-500 leading-relaxed">
              This web app is 100% Android-ready via Capacitor. Native hardware camera, local storage, and push notifications are pre-configured.
            </p>
          </div>
        </div>

        {/* Logout */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <Link href="/billing" className="text-xs font-semibold text-emerald-600 hover:underline">
            Manage Subscription
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
