'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Download,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function BillingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [currentTier, setCurrentTier] = useState('free');
  const [creditsRemaining, setCreditsRemaining] = useState(5);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadBillingData();

    // Dynamically load Razorpay SDK for seamless popup checkout
    if (typeof window !== 'undefined' && !document.getElementById('razorpay-sdk')) {
      const script = document.createElement('script');
      script.id = 'razorpay-sdk';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  async function loadBillingData() {
    try {
      const res = await apiClient.billing.getPlans();
      setPlans(res.plans || []);
      setCurrentTier(res.currentTier || 'free');
      setCreditsRemaining(res.creditsRemaining ?? 5);
      setInvoices(res.invoices || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleRazorpayUpgrade = async (tierId: string) => {
    if (tierId === 'free' || tierId === currentTier) return;
    setUpgradingTier(tierId);
    setMessage(null);

    try {
      const orderRes = await apiClient.billing.createRazorpayOrder(tierId);

      // If Razorpay SDK loaded on window
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const options = {
          key: orderRes.keyId,
          amount: orderRes.order.amount,
          currency: 'INR',
          name: 'Plantinia AI Plant Doctor',
          description: `Upgrade to ${orderRes.plan.name}`,
          order_id: orderRes.order.id,
          handler: async (response: any) => {
            try {
              const verifyRes = await apiClient.billing.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                tier: tierId,
              });
              setMessage({ text: verifyRes.message, type: 'success' });
              await loadBillingData();
            } catch (err: any) {
              setMessage({ text: err.message || 'Payment verification failed', type: 'error' });
            }
          },
          prefill: {
            name: 'Gardener',
            email: 'user@plantinia.app',
          },
          theme: {
            color: '#059669',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Direct mock verify for sandbox
        const verifyRes = await apiClient.billing.verifyRazorpayPayment({
          razorpay_order_id: orderRes.order.id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'sandbox_pass',
          tier: tierId,
        });
        setMessage({ text: verifyRes.message, type: 'success' });
        await loadBillingData();
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Upgrade initiation failed', type: 'error' });
    } finally {
      setUpgradingTier(null);
    }
  };

  const handleStripeUpgrade = async (tierId: string) => {
    setUpgradingTier(tierId);
    try {
      const res = await apiClient.billing.createStripeSession(tierId);
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Stripe initiation failed', type: 'error' });
      setUpgradingTier(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
          <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
          <span>Subscriptions & Monetization</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Plans & Billing
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Scale seamlessly with generous free monthly scans or unlock unlimited multimodal AI diagnostics.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-800 dark:text-rose-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Current Plan Overview Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Current Subscription
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white uppercase">
              {currentTier} Plan
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {currentTier === 'free'
              ? `${creditsRemaining} free AI diagnoses remaining this calendar month.`
              : 'Unlimited AI leaf & video scans and 24/7 agronomist chat activated.'}
          </p>
        </div>

        {currentTier === 'free' && (
          <button
            onClick={() => handleRazorpayUpgrade('pro')}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            Upgrade to Pro (₹399/mo)
          </button>
        )}
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = currentTier === plan.id;
          const isPro = plan.id === 'pro';

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
                isPro
                  ? 'bg-gradient-to-b from-emerald-950 via-[#0e1713] to-[#0c120f] text-white border-2 border-emerald-500 shadow-xl'
                  : 'bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] text-slate-900 dark:text-white'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                  {plan.badge}
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-3xl font-extrabold">
                    {plan.priceINR === 0 ? 'Free' : `₹${plan.priceINR}`}
                  </span>
                  {plan.priceINR > 0 && (
                    <span className="text-xs text-slate-400">/month (${plan.priceUSD} USD)</span>
                  )}
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {plan.features.map((feat: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isPro ? 'text-emerald-400' : 'text-emerald-600'
                        }`}
                      />
                      <span className={isPro ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300'}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 space-y-2">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold cursor-default"
                  >
                    Current Plan
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleRazorpayUpgrade(plan.id)}
                      disabled={upgradingTier === plan.id}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                        isPro
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {upgradingTier === plan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Pay with UPI / Razorpay (₹{plan.priceINR})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    {plan.priceUSD > 0 && (
                      <button
                        onClick={() => handleStripeUpgrade(plan.id)}
                        className="w-full py-2 text-center text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        or pay with Stripe (${plan.priceUSD} USD)
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoices Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Billing History & Invoices</h3>
        {invoices.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No past payment receipts found.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {invoices.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{inv.plan}</p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(inv.createdAt).toLocaleDateString()} • {inv.provider.toUpperCase()} (ID: {inv.providerPaymentId})
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {inv.currency === 'INR' ? `₹${inv.amount}` : `$${inv.amount}`}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 text-[10px] font-bold uppercase">
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
