'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search, AlertCircle, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function KnowledgePage() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiClient.knowledge.list();
        if (active) setItems(Array.isArray(res.items) ? res.items : []);
      } catch (err: any) {
        if (active) setError(err?.message || 'Unable to load the plant library.');
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const symptoms = Array.isArray(item.symptoms) ? item.symptoms : [];
      const affected = Array.isArray(item.affectedPlants) ? item.affectedPlants : [];
      const matchesSearch = !q || String(item.title || '').toLowerCase().includes(q) || symptoms.some((s:any) => String(s).toLowerCase().includes(q)) || affected.some((p:any) => String(p).toLowerCase().includes(q));
      return matchesSearch && (category === 'all' || String(item.category || '').toLowerCase() === category);
    });
  }, [items, search, category]);

  return <div className="max-w-5xl mx-auto space-y-6">
    <div><div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2"><BookOpen className="w-3.5 h-3.5 text-emerald-500"/>Botanical RAG Pathology Archive</div><h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Plant Disease & Pest Encyclopedia</h1><p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Explore disease, pest, deficiency, treatment, and prevention references.</p></div>
    <div className="flex flex-col sm:flex-row items-center gap-3"><div className="relative flex-1 w-full"><Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"/><input type="text" placeholder="Search diseases, pests, affected species..." value={search} onChange={(e)=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111815] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"/></div><div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">{['all','disease','pest','deficiency'].map((cat)=><button key={cat} onClick={()=>setCategory(cat)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap ${category===cat?'bg-emerald-600 text-white':'bg-white dark:bg-[#111815] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>{cat}</button>)}</div></div>
    {loading && <div className="py-20 text-center text-xs text-slate-400">Loading encyclopedia...</div>}
    {!loading && error && <div className="rounded-3xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-6 text-sm text-rose-700 dark:text-rose-300">{error}</div>}
    {!loading && !error && filteredItems.length===0 && <div className="text-center py-16 bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-slate-800 p-8"><AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2"/><h3 className="text-sm font-bold text-slate-900 dark:text-white">No Records Found</h3><p className="text-xs text-slate-500 mt-1">Try another disease, pest, or plant name.</p></div>}
    {!loading && !error && filteredItems.length>0 && <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{filteredItems.map((item)=>{const symptoms=Array.isArray(item.symptoms)?item.symptoms:[];const affected=Array.isArray(item.affectedPlants)?item.affectedPlants:[];return <div key={item.id} className="bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-[#223129] overflow-hidden p-5 flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-all"><div className="flex items-start gap-4">{item.imageUrl?<img src={item.imageUrl} alt={item.title||'Plant pathology'} className="w-20 h-20 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-800 shrink-0"/>:<div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 shrink-0"/>}<div className="min-w-0"><span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">{item.category||'reference'}</span><h3 className="text-base font-bold text-slate-900 dark:text-white truncate mt-1">{item.title||'Untitled record'}</h3><p className="text-xs text-slate-500 line-clamp-1">Affects: {affected.join(', ')||'Not specified'}</p></div></div><div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800"><p className="line-clamp-2"><strong>Treatment: </strong>{item.treatment||'See diagnosis guidance.'}</p><p className="line-clamp-2 text-slate-500"><strong>Prevention: </strong>{item.prevention||'Maintain good sanitation and monitoring.'}</p></div><div className="flex items-center justify-between gap-2"><div className="flex flex-wrap gap-1">{symptoms.slice(0,2).map((s:any,i:number)=><span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">{String(s)}</span>)}</div><Link href={`/diagnose?hint=${encodeURIComponent(String(item.title||''))}`} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">Scan for This<ArrowRight className="w-3.5 h-3.5"/></Link></div></div>})}</div>}
  </div>;
}
