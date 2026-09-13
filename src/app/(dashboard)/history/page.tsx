'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, AlertTriangle, CheckCircle2, Clock3, Leaf } from 'lucide-react';

type Scan = {
  id: string;
  species: string;
  disease: string;
  confidence: number;
  severity: string;
  mediaType?: string;
  date: string;
};

export default function HistoryPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then((r) => r.json())
      .then((res) => setScans(res.report?.standaloneScans ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Plantinia records</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">Scan History</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Every saved AI scan appears here, including scans not yet added to My Garden.</p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-10 text-center text-sm text-slate-400">Loading scan history...</div>
      ) : scans.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
          <Leaf className="mx-auto h-10 w-10 text-emerald-500" />
          <h2 className="mt-4 font-bold text-slate-900 dark:text-white">No scans yet</h2>
          <p className="mt-1 text-sm text-slate-500">Run an AI Plant Doctor scan and it will be recorded here.</p>
          <Link href="/diagnose" className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Run a scan</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {scans.map((scan) => {
            const critical = ['severe', 'critical'].includes(String(scan.severity).toLowerCase());
            const healthy = scan.disease.toLowerCase().includes('healthy');
            return (
              <div key={scan.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111815]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-950/40">
                      {healthy ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : critical ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <Activity className="h-5 w-5 text-amber-500" />}
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 dark:text-white">{scan.species}</h2>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{scan.disease}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" />{new Date(scan.date).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">{scan.severity}</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">{scan.confidence}% confidence</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
