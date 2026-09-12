'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Share2,
  Printer,
  MessageSquareText,
  ShieldCheck,
  CalendarPlus,
  Sparkles,
  ShoppingBag,
  Beaker,
  AlertOctagon,
  CheckCircle2,
  Leaf,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { SeverityBadge } from '@/components/diagnosis/SeverityBadge';
import { BoundingBoxOverlay } from '@/components/diagnosis/BoundingBoxOverlay';

export default function DiagnosisResultPage() {
  const params = useParams();
  const router = useRouter();
  const diagnosisId = params?.id as string;

  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'treatment' | 'organic' | 'chemical' | 'prevent'>('treatment');
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!diagnosisId) return;
    apiClient.diagnose.get(diagnosisId).then((res) => {
      setDiagnosis(res.diagnosis);
    }).catch((err) => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, [diagnosisId]);

  const toggleStep = (stepIdx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [stepIdx]: !prev[stepIdx] }));
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500">Loading comprehensive pathology report...</p>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Diagnosis Not Found</h2>
        <Link href="/diagnose" className="text-xs text-emerald-600 font-semibold underline">
          Back to Scanner
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scanner</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
          </button>
          <Link
            href={`/chat?plantId=${diagnosis.plantId || ''}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:scale-102 transition-all"
          >
            <MessageSquareText className="w-4 h-4" />
            <span>Consult Dr. Flora</span>
          </Link>
        </div>
      </div>

      {/* Hero Result Banner */}
      <div className="bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-[#223129] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {diagnosis.identifiedSpecies}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-400">
                {new Date(diagnosis.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {diagnosis.diseaseName}
            </h1>
            <p className="text-xs text-slate-500">
              Pathogen Classification: <strong className="uppercase">{diagnosis.pathogenType}</strong>
            </p>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0">
            <SeverityBadge severity={diagnosis.severity} className="text-sm px-3 py-1" />
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {diagnosis.confidence}%
              </span>
              <span className="block text-[10px] text-slate-400">AI Confidence</span>
            </div>
          </div>
        </div>

        {/* Specimen Media & Prognosis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Analyzed Leaf Specimen (with Pathology Hotspots)
            </span>
            <BoundingBoxOverlay
              imageUrl={diagnosis.mediaUrl}
              boxes={diagnosis.boundingBoxes}
              className="border border-slate-200 dark:border-slate-800"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                Clinical Prognosis
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#16201a] p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                {diagnosis.prognosis}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Identified Symptoms
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {diagnosis.symptoms?.map((s: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Underlying Causes & Vector Risks
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {diagnosis.causes?.map((c: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Treatment Tabs Navigation */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
            <button
              onClick={() => setActiveTab('treatment')}
              className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'treatment'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Step-by-Step Protocol
            </button>
            <button
              onClick={() => setActiveTab('organic')}
              className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1 ${
                activeTab === 'organic'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Beaker className="w-3.5 h-3.5" />
              <span>What to Make at Home</span>
            </button>
            <button
              onClick={() => setActiveTab('chemical')}
              className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1 ${
                activeTab === 'chemical'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>What to Buy</span>
            </button>
            <button
              onClick={() => setActiveTab('prevent')}
              className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'prevent'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Prevention
            </button>
          </div>

          {/* Tab 1: Step-by-Step Protocol */}
          {activeTab === 'treatment' && (
            <div className="pt-6 space-y-3">
              {diagnosis.treatmentSteps?.map((step: any, idx: number) => {
                const isDone = completedSteps[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                      isDone
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 opacity-80'
                        : 'bg-white dark:bg-[#141d18] border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                    }`}
                  >
                    <div className="mt-0.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.stepNumber || idx + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-sm font-bold ${
                            isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {step.title}
                        </h4>
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                          {step.frequency}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {step.instruction}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: What to Make at Home (Organic) */}
          {activeTab === 'organic' && (
            <div className="pt-6 space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  Eco-Friendly & Non-Toxic Home Protocols
                </span>
                <p>Safe for pets, pollinators, and edible vegetable gardens.</p>
              </div>

              <div className="space-y-3">
                {diagnosis.organicRemedies?.map((remedy: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white dark:bg-[#141d18] border border-slate-200 dark:border-slate-800"
                  >
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                      {remedy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: What to Buy (Chemical / Commercial) */}
          {activeTab === 'chemical' && (
            <div className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {diagnosis.chemicalRemedies?.map((product: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white dark:bg-[#141d18] border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {product.name}
                        </h4>
                        <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {product.approximateCost}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic">
                        Active Ingredient: {product.activeIngredient}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                        {product.instructions}
                      </p>
                    </div>

                    <a
                      href={`https://www.google.com/search?q=buy+${encodeURIComponent(product.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors mt-2"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Check Retailer Availability</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Prevention */}
          {activeTab === 'prevent' && (
            <div className="pt-6 space-y-3">
              {diagnosis.preventativeMeasures?.map((prev: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#141d18] border border-slate-200 dark:border-slate-800"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{prev}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
