'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flower2,
  Plus,
  Search,
  Droplets,
  Sun,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function PlantsPage() {
  const [plants, setPlants] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.plants.list().then((res) => {
      setPlants(res.plants || []);
    }).catch(console.error).finally(() => {
      setLoading(false);
    });
  }, []);

  const filteredPlants = plants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.species.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = filterLocation === 'all' || p.location === filterLocation;
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            My Garden Collection
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track health progress, watering cycles, and medical history across your plant collection.
          </p>
        </div>

        <Link
          href="/plants/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-emerald-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Plant</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by nickname or scientific species..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111815] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'indoor', 'outdoor', 'balcony'].map((loc) => (
            <button
              key={loc}
              onClick={() => setFilterLocation(loc)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                filterLocation === loc
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#111815] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Plants Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading plants...</div>
      ) : filteredPlants.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <Flower2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Plants Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search ? 'No plants match your search criteria.' : 'Start tracking your botanical collection today!'}
          </p>
          <Link
            href="/plants/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Plant</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlants.map((plant) => (
            <Link
              key={plant.id}
              href={`/plants/${plant.id}`}
              className="bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-[#223129] overflow-hidden hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 w-full bg-black overflow-hidden">
                <img
                  src={plant.imageUrl}
                  alt={plant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-md capitalize ${
                      plant.healthStatus === 'healthy'
                        ? 'bg-emerald-500/90 text-white'
                        : plant.healthStatus === 'warning'
                        ? 'bg-amber-500/90 text-white'
                        : 'bg-rose-500/90 text-white'
                    }`}
                  >
                    {plant.healthStatus}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="px-2 py-0.5 rounded-lg bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs uppercase tracking-wider">
                    {plant.location}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {plant.name}
                  </h3>
                  <p className="text-xs text-slate-500 italic mt-0.5">{plant.species}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" />
                    <span>Every {plant.wateringFrequencyDays}d</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span className="capitalize">{plant.sunlightNeeds}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
