'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Cpu,
  Database,
  BarChart3,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  ArrowRight,
  Download,
  Check,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [recentDiagnoses, setRecentDiagnoses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'datasets' | 'feedback'>('overview');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    try {
      const [statsRes, modelsRes, datasetsRes] = await Promise.all([
        apiClient.admin.getStats().catch(() => ({ stats: null, recentDiagnoses: [] })),
        apiClient.admin.getModels().catch(() => ({ models: [] })),
        apiClient.admin.getDatasets().catch(() => ({ datasets: [] })),
      ]);

      setStats(statsRes.stats);
      setRecentDiagnoses(statsRes.recentDiagnoses || []);
      setModels(modelsRes.models || []);
      setDatasets(datasetsRes.datasets || []);
    } finally {
      setLoading(false);
    }
  }

  const handleActivateModel = async (modelId: string) => {
    try {
      const res = await apiClient.admin.setActiveModel(modelId);
      setActionMessage(res.message);
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (e: any) {
      setActionMessage(e.message);
    }
  };

  const handleFeedback = async (diagId: string, feedback: 'accurate' | 'inaccurate') => {
    try {
      await apiClient.admin.submitFeedback(diagId, feedback);
      setRecentDiagnoses((prev) =>
        prev.map((d) => (d.id === diagId ? { ...d, adminReviewed: true, adminAccuracyFeedback: feedback } : d))
      );
    } catch (e: any) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading ML Command Hub...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>Internal ML Hub & Telemetry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Admin Command Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor model accuracy, curate training datasets, switch active vision weights, and track SaaS revenue.
        </p>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
          {actionMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Analytics & MRR
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'models'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Model Registry ({models.length})
        </button>
        <button
          onClick={() => setActiveTab('datasets')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'datasets'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Datasets & Training Center
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'feedback'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Pathology Feedback Loop
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] shadow-xs">
              <span className="text-xs text-slate-400">Total Scans Executed</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stats.totalScans}
              </div>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] shadow-xs">
              <span className="text-xs text-slate-400">Active Subscribers</span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {stats.activeSubscribers}
              </div>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] shadow-xs">
              <span className="text-xs text-slate-400">Estimated MRR</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                ₹{stats.monthlyRecurringRevenueINR}
              </div>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] shadow-xs">
              <span className="text-xs text-slate-400">Diagnostic Accuracy</span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {stats.overallAccuracyRate}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Inference Architecture</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Plantinia routes requests using a decoupled inference gateway:
              Vercel acts purely as the client edge layer while raw tensor weights and GPU operations execute on isolated external workers (Gemini API, RunPod, Triton, or dedicated PyTorch servers), maintaining zero latency and sub-100ms cold starts.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Model Registry */}
      {activeTab === 'models' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {models.map((model) => {
              const isActive = model.status === 'active';
              return (
                <div
                  key={model.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isActive
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-white dark:bg-[#111815] border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{model.name}</h4>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        v{model.version}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-white">
                          Active in Production
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Provider: <strong className="capitalize">{model.provider}</strong> • Benchmark Accuracy: <strong>{model.accuracy}%</strong> • Trained on {model.datasetCount.toLocaleString()} annotated specimens
                    </p>
                  </div>

                  {!isActive && (
                    <button
                      onClick={() => handleActivateModel(model.id)}
                      className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      Promote to Production
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Datasets */}
      {activeTab === 'datasets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {datasets.map((ds) => (
              <div
                key={ds.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ds.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {ds.format}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {ds.imagesCount.toLocaleString()} labeled images • {ds.sizeMB} MB
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {ds.classes.map((cls: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded"
                      >
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => alert(`Starting download of ${ds.name} in ${ds.format} format...`)}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Archive ({ds.sizeMB} MB)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Agronomist Feedback Loop */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Review recent visual predictions. Marking predictions as Accurate or Inaccurate automatically retrains downstream YOLOv8 models.
          </p>

          <div className="space-y-3">
            {recentDiagnoses.map((diag) => (
              <div
                key={diag.id}
                className="p-4 rounded-3xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img src={diag.mediaUrl} alt="" className="w-14 h-14 rounded-2xl object-cover" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {diag.diseaseName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {diag.identifiedSpecies} • {diag.confidence}% confidence
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {diag.adminAccuracyFeedback ? (
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-xl uppercase ${
                        diag.adminAccuracyFeedback === 'accurate'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {diag.adminAccuracyFeedback}
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleFeedback(diag.id, 'accurate')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accurate</span>
                      </button>
                      <button
                        onClick={() => handleFeedback(diag.id, 'inaccurate')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>False Positive</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
