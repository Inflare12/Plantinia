'use client';

import React, { useState, useEffect } from 'react';
import { Printer, Download, ShieldCheck, Flower2, AlertTriangle, CheckCircle2, History } from 'lucide-react';

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports').then((r) => r.json()).then((res) => setReport(res.report)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDownloadJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Plantinia-Health-Report-${report.reportId}.json`; a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <div className="py-20 text-center text-xs text-slate-400">Compiling botanical health report...</div>;
  if (!report) return <div className="py-20 text-center text-xs text-slate-400">Failed to generate health report.</div>;

  const score = report.gardenSummary.healthScorePercentage;

  return <div className="max-w-4xl mx-auto space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div><h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Garden Health Medical Report</h1><p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Generated Report ID: <strong className="text-emerald-600 dark:text-emerald-400">{report.reportId}</strong></p></div>
      <div className="flex items-center gap-2"><button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111815] text-xs font-semibold text-slate-700 dark:text-slate-300"><Printer className="w-4 h-4" />Print Report</button><button onClick={handleDownloadJSON} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"><Download className="w-4 h-4" />Export Data</button></div>
    </div>

    <div className="bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-[#223129] p-6 sm:p-8 shadow-xs space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4"><div><span className="text-xs uppercase font-bold text-emerald-600 tracking-wider">Plantinia Botanical Pathology Service</span><h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">Garden Biome Health Evaluation</h2><p className="text-xs text-slate-400">Evaluated for: {report.owner.name} ({report.owner.email}) • Tier: {report.owner.subscriptionTier.toUpperCase()}</p></div><div className="text-right"><span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{score == null ? '—' : `${score}%`}</span><span className="block text-[11px] text-slate-400">{score == null ? 'No plants tracked yet' : 'Overall Garden Vigor'}</span></div></div>

      <div className="grid grid-cols-3 gap-4 text-center"><div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#18231d]"><span className="block text-xl font-bold text-slate-900 dark:text-white">{report.gardenSummary.totalPlants}</span><span className="text-xs text-slate-400">Tracked Specimens</span></div><div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40"><span className="block text-xl font-bold text-emerald-700 dark:text-emerald-400">{report.gardenSummary.statusCounts.healthy}</span><span className="text-xs text-emerald-600/80 dark:text-emerald-400/80">Healthy Specimens</span></div><div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40"><span className="block text-xl font-bold text-amber-700 dark:text-amber-400">{report.gardenSummary.statusCounts.attentionRequired + report.gardenSummary.statusCounts.criticalIntervention}</span><span className="text-xs text-amber-600/80 dark:text-amber-400/80">Under Active Care</span></div></div>

      <div className="space-y-3"><h3 className="text-sm font-bold text-slate-900 dark:text-white">Specimen Roster & Pathologies</h3>{report.plants.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-sm text-slate-400">No plants are tracked yet. Your standalone AI scans are recorded in Scan History.</div> : <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold"><tr><th className="py-2.5">Plant Name</th><th className="py-2.5">Species</th><th className="py-2.5">Location</th><th className="py-2.5">Status</th><th className="py-2.5">Recent Findings</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">{report.plants.map((p:any)=><tr key={p.id}><td className="py-3 font-bold text-slate-900 dark:text-white">{p.name}</td><td className="py-3 text-slate-500 italic">{p.species}</td><td className="py-3 capitalize text-slate-500">{p.location}</td><td className="py-3 capitalize font-semibold text-emerald-600 dark:text-emerald-400">{p.healthStatus}</td><td className="py-3 text-slate-600 dark:text-slate-300">{p.recentDiagnoses.length ? `${p.recentDiagnoses[0].disease} (${p.recentDiagnoses[0].confidence})` : 'No active pathology'}</td></tr>)}</tbody></table></div>}</div>

      {report.standaloneScans?.length > 0 && <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800"><div className="flex items-center gap-2"><History className="w-4 h-4 text-emerald-600" /><h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent AI Scan History</h3></div><div className="space-y-3">{report.standaloneScans.map((scan:any)=><div key={scan.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#18231d] border border-slate-100 dark:border-slate-800/80"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"><div><p className="font-bold text-slate-900 dark:text-white">{scan.species}</p><p className="text-sm text-slate-700 dark:text-slate-300">{scan.disease}</p><p className="text-xs text-slate-400 mt-1">{new Date(scan.date).toLocaleString()}</p></div><div className="flex gap-2 text-xs"><span className="rounded-full bg-slate-200 px-2.5 py-1 font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">{scan.severity}</span><span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">{scan.confidence}% confidence</span></div></div></div>)}</div></div>}

      {report.actionableProtocols.length > 0 && <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800"><h3 className="text-sm font-bold text-slate-900 dark:text-white">Recommended Agronomic Prescriptions</h3><div className="space-y-3">{report.actionableProtocols.map((protocol:any,idx:number)=><div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#18231d] border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs"><h4 className="font-bold text-slate-900 dark:text-white text-sm">{protocol.disease}</h4>{protocol.organicWhatToMake?.[0]&&<p className="text-slate-600 dark:text-slate-300"><strong>Organic Remedy: </strong>{protocol.organicWhatToMake[0]}</p>}{protocol.chemicalWhatToBuy?.[0]&&<p className="text-slate-600 dark:text-slate-300"><strong>Commercial Remedy: </strong>{protocol.chemicalWhatToBuy[0].name} ({protocol.chemicalWhatToBuy[0].approximateCost})</p>}</div>)}</div></div>}
    </div>
  </div>;
}
