'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Sprout, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams?.get('email') || '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage('Your email address is missing. Please return to signup.');
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setMessage('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await apiClient.auth.verifyEmail(email, code);
      setSuccess(true);
      setMessage(res.message || 'Email successfully verified!');
    } catch (err: any) {
      setSuccess(false);
      setMessage(err.message || 'The verification code is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#090d0b]">
      <div className="w-full max-w-md bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-[#223129] p-8 shadow-xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          {success ? (
            <CheckCircle2 className="w-8 h-8" />
          ) : (
            <Sprout className="w-8 h-8" />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {success ? 'Email Verified!' : 'Verify Your Email'}
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            {success
              ? message
              : email
                ? `We sent a 6-digit verification code to ${email}.`
                : 'Enter the 6-digit verification code sent to your email.'}
          </p>
        </div>

        {!success && (
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label
                htmlFor="verification-code"
                className="block text-left text-xs font-bold text-slate-700 dark:text-slate-300 mb-2"
              >
                Verification Code
              </label>

              <input
                id="verification-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setCode(value);
                  setMessage('');
                }}
                placeholder="000000"
                className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold rounded-xl border border-slate-200 dark:border-[#2a3b32] bg-slate-50 dark:bg-[#0d1411] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {message && (
              <div className="flex items-start gap-2 text-left text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6 || !email}
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {success ? (
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
          >
            <span>Proceed to Garden Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-sm transition-all"
          >
            <span>Return to Sign In</span>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#090d0b]">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading verification...</span>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
