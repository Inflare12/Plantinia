'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Bug,
  AlertCircle,
  Leaf,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function KnowledgePage() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKnowledge();
  }, []);

  async function loadKnowledge() {
    try {
      const res = await apiClient.knowledge.list();
      setItems(res.items || []);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.symptoms.some((s: string) => s.toLowerCase().includes(search.toLowerCase())) ||
      item.affectedPlants.some((p: string) => p.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = category === 'all' || item.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
          <span>Botanical RAG Pathology Archive</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Plant Disease & Pest Encyclopedia
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore comprehensive scientific treatments, active ingredients, and symptom identification guides.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search diseases, pests, affected species (e.g. Tomato, Blight, Spider Mites)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111815] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'disease', 'pest', 'deficiency'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-[#111815] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading encyclopedia...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <h3 className="text-sm font-bold">No Records Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try searching for &quot;Blight&quot;, &quot;Mildew&quot;, or &quot;Pests&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-[#223129] overflow-hidden p-5 flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-all group"
            >
              <div className="flex items-start gap-4">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-20 h-20 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-800 shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    Affects: {item.affectedPlants.join(', ')}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="line-clamp-2 leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-200 font-semibold">Treatment: </strong>
                  {item.treatment}
                </p>
                <p className="line-clamp-2 leading-relaxed text-slate-500">
                  <strong className="text-slate-700 dark:text-slate-300 font-semibold">Prevention: </strong>
                  {item.prevention}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-wrap gap-1">
                  {item.symptoms.slice(0, 2).map((s: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/diagnose?hint=${encodeURIComponent(item.title)}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
                >
                  <span>Scan for This</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
