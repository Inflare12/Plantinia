'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sprout,
  ScanLine,
  Camera,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Droplets,
  CloudSun,
  CheckCircle2,
  Play,
  Leaf,
  Layers,
  Award,
  Zap,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BoundingBoxOverlay } from '@/components/diagnosis/BoundingBoxOverlay';
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_TIER_ORDER } from '@/lib/payments/types';

export default function LandingPage() {
  const [demoSelected, setDemoSelected] = useState<'blight' | 'rose' | 'monstera'>('blight');

  const demoData = {
    blight: {
      title: 'Tomato Late Blight',
      species: 'Solanum lycopersicum (Tomato)',
      confidence: 96.4,
      severity: 'severe',
      imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&auto=format&fit=crop&q=80',
      boxes: [
        { x: 25, y: 35, width: 40, height: 35, label: 'Late Blight Lesion' },
        { x: 68, y: 55, width: 22, height: 24, label: 'Sporulating Fringe' },
      ],
      cure: 'Prune infected canopy immediately; spray copper soap early morning.',
    },
    rose: {
      title: 'Rose Black Spot',
      species: 'Rosa gallica (Garden Rose)',
      confidence: 94.8,
      severity: 'moderate',
      imageUrl: 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=600&auto=format&fit=crop&q=80',
      boxes: [{ x: 30, y: 32, width: 35, height: 30, label: 'Diplocarpon Lesion' }],
      cure: 'Apply organic baking soda & cold-pressed neem spray weekly.',
    },
    monstera: {
      title: 'Chlorosis & Edema',
      species: 'Monstera deliciosa',
      confidence: 92.1,
      severity: 'mild',
      imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&auto=format&fit=crop&q=80',
      boxes: [{ x: 35, y: 40, width: 30, height: 30, label: 'Chlorotic Zone' }],
      cure: 'Aerate soil substrate; increase indirect sunlight exposure.',
    },
  };

  const activeDemo = demoData[demoSelected];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070a08] selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
          {/* Subtle Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Copy */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300/60 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wide shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Autonomous Multimodal Plant Doctor SaaS</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.12]">
                  Diagnose & Heal Any Plant Disease with{' '}
                  <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
                    AI Precision.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Snap a leaf photo or record plant video. Plantinia detects 120+ pathogens, calculates severity, provides chemical & organic home prescriptions, and syncs microclimate spore alerts.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 active:scale-95 transition-all"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Start Diagnosing Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="#demo"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#18231d] text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all"
                  >
                    <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                    <span>Try Interactive Demo</span>
                  </Link>
                </div>

                <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 5 Free Scans / Month
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Razorpay & Stripe
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Android Capacitor Ready
                  </span>
                </div>
              </div>

              {/* Right Hero Demo Card */}
              <div className="lg:col-span-5">
                <div className="bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-[#223129] p-5 sm:p-6 shadow-2xl relative">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Live AI Neural Vision
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {activeDemo.confidence}% Confidence
                    </span>
                  </div>

                  <div className="py-4 space-y-3">
                    <BoundingBoxOverlay
                      imageUrl={activeDemo.imageUrl}
                      boxes={activeDemo.boxes}
                      className="rounded-2xl"
                    />

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#16201a] border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {activeDemo.title}
                        </h4>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          {activeDemo.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 italic">{activeDemo.species}</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 pt-1 leading-relaxed font-medium">
                        <strong>Protocol: </strong>
                        {activeDemo.cure}
                      </p>
                    </div>

                    {/* Specimen Switcher */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        onClick={() => setDemoSelected('blight')}
                        className={`py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
                          demoSelected === 'blight'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-[#18231d] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Tomato Blight
                      </button>
                      <button
                        onClick={() => setDemoSelected('rose')}
                        className={`py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
                          demoSelected === 'rose'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-[#18231d] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Rose Black Spot
                      </button>
                      <button
                        onClick={() => setDemoSelected('monstera')}
                        className={`py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
                          demoSelected === 'monstera'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-[#18231d] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Monstera Rot
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="py-20 bg-white dark:bg-[#0c120f] border-y border-slate-200/80 dark:border-[#1e2a24]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                End-to-End Plant Health Ecosystem
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Everything You Need to Save Your Garden
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm">
                From balcony fiddle-leaf figs to multi-acre tomato nurseries, Plantinia combines botanical vision models with practical agronomy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111815] border border-slate-200/80 dark:border-[#223129] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <ScanLine className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Multimodal Leaf & Video Vision
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Analyze high-res photos and video recordings. Highlights necrotic spots with bounding box overlays and calculates biological pathogen confidence.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111815] border border-slate-200/80 dark:border-[#223129] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  &quot;What to Make &amp; What to Buy&quot;
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Dual prescriptions: non-toxic DIY recipes (neem, baking soda, compost tea) plus exact commercial fungicides with active ingredients and price estimates.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111815] border border-slate-200/80 dark:border-[#223129] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                  <CloudSun className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Microclimate Agronomy &amp; Frost Alerts
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Real-time ambient humidity and fungal risk tracking. Alerts you before powdery mildew spreads or unexpected night frosts hit tropical foliage.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111815] border border-slate-200/80 dark:border-[#223129] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <MessageSquareText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  24/7 Dr. Flora AI Doctor
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Conversational plant pathologist with complete memory of your plant&apos;s past infections, pruning schedule, and watering logs.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111815] border border-slate-200/80 dark:border-[#223129] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Droplets className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Automated Care &amp; Watering Engine
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Smart checklist that adjusts hydration frequency based on seasons, pot size, indoor heater dry air, and outdoor monsoon precipitation.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111815] border border-slate-200/80 dark:border-[#223129] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Printable Agronomy Reports (PDF)
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Export structured medical summaries for nursery consultations, master gardeners, commercial greenhouse audits, and personal records.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Transparent Pricing
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Start Free, Upgrade as Your Garden Grows
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm">
                No credit card required for 5 free monthly scans. Powered by Razorpay UPI and Stripe.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-stretch">
              {SUBSCRIPTION_TIER_ORDER.map((tierId) => {
                const plan = SUBSCRIPTION_PLANS[tierId];
                const isPro = plan.id === 'pro';

                return (
                  <div
                    key={plan.id}
                    className={`p-6 rounded-3xl flex flex-col justify-between relative transition-all ${
                      isPro
                        ? 'bg-gradient-to-b from-emerald-950 via-[#0e1713] to-[#0c120f] text-white border-2 border-emerald-500 shadow-2xl scale-[1.02]'
                        : 'bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] text-slate-900 dark:text-white'
                    }`}
                  >
                    {plan.badge && (
                      <span className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md ${
                        isPro
                          ? 'bg-emerald-500 text-slate-950'
                          : plan.id === 'doctor'
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}>
                        {plan.badge}
                      </span>
                    )}
                    <div>
                      <h3 className="text-base font-bold">{plan.name}</h3>
                      <p className={`text-xs mt-1 ${isPro ? 'text-emerald-200/80' : 'text-slate-500'}`}>
                        {plan.description}
                      </p>
                      <div className="my-5">
                        <span className="text-3xl font-black">
                          {plan.priceINR === 0 ? '₹0' : `₹${plan.priceINR}`}
                        </span>
                        <span className={`text-[11px] ${isPro ? 'text-emerald-300/80' : 'text-slate-400'}`}>
                          {plan.priceINR === 0 ? ' / forever' : ` / mo ($${plan.priceUSD})`}
                        </span>
                      </div>
                      <ul className="space-y-2 text-xs">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2
                              className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                                isPro ? 'text-emerald-400' : 'text-emerald-500'
                              }`}
                            />
                            <span className={isPro ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300'}>
                              {feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link
                      href={plan.id === 'free' ? '/signup' : `/signup?tier=${plan.id}`}
                      className={`mt-6 block w-full py-2.5 text-center rounded-xl font-bold text-xs transition-all active:scale-95 ${
                        isPro
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30'
                          : plan.id === 'doctor'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                      }`}
                    >
                      {plan.ctaText}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
