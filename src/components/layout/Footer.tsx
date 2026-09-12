import React from 'react';
import Link from 'next/link';
import { Sprout, Heart, Shield, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070a08] text-slate-600 dark:text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">Plantinia</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Autonomous AI Plant Doctor diagnosing 120+ botanical pathologies with multimodal computer vision. Built for home gardeners, urban balconies, and commercial nurseries.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/diagnose" className="hover:text-emerald-500">AI Leaf & Video Scan</Link></li>
              <li><Link href="/chat" className="hover:text-emerald-500">Dr. Flora AI Doctor</Link></li>
              <li><Link href="/knowledge" className="hover:text-emerald-500">Disease Encyclopedia</Link></li>
              <li><Link href="/weather" className="hover:text-emerald-500">Microclimate Agronomy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">Developers & Mobile</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/billing" className="hover:text-emerald-500">API Access & Pricing</Link></li>
              <li><Link href="/admin" className="hover:text-emerald-500">Model Registry & Datasets</Link></li>
              <li><span className="text-emerald-600 dark:text-emerald-400 font-medium">Capacitor Android Ready</span></li>
              <li><span className="text-slate-500">Vercel Edge Compatible</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">Trust & Security</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Razorpay 256-bit Encrypted</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
              Disclaimer: Plantinia AI diagnosis provides botanical guidance based on visual symptoms. For widespread commercial quarantine outbreaks, confirm with local agricultural agencies.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Plantinia AI Inc. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 inline" /> for plants and farmers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
