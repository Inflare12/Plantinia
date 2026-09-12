'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Camera, Upload, Sparkles, Sprout, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { CameraCaptureModal } from '@/components/camera/CameraCaptureModal';

export default function NewPlantPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState<'indoor' | 'outdoor' | 'balcony' | 'greenhouse'>('indoor');
  const [sunlightNeeds, setSunlightNeeds] = useState<'direct' | 'indirect' | 'low' | 'shade'>('indirect');
  const [wateringDays, setWateringDays] = useState(7);
  const [notes, setNotes] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Please give your plant a nickname.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.plants.create({
        name,
        species: species || 'Tropical Botanical Species',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&auto=format&fit=crop&q=80',
        location,
        sunlightNeeds,
        wateringFrequencyDays: wateringDays,
        notes,
      });

      router.push(`/plants/${res.plant.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to add plant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/plants"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Garden</span>
      </Link>

      <div className="bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-[#223129] p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Add Plant to Garden
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Plantinia will calculate personalized hydration cycles and track health over time.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Specimen Photo Selector */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => setIsCameraOpen(true)}
            className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-[#18231d] border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 overflow-hidden group shrink-0"
          >
            {imageUrl ? (
              <img src={imageUrl} alt="Plant" className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 mb-1" />
                <span className="text-[10px] text-slate-400 font-medium">Add Photo</span>
              </>
            )}
          </div>

          <div className="flex-1 text-xs text-slate-500">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Plant Photo</p>
            <p className="mt-0.5">Snap a picture with mobile camera or upload from device gallery.</p>
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Open Camera / Select Specimen
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Plant Nickname *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Living Room Monstera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Botanical Species (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Monstera deliciosa"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-xs"
              >
                <option value="indoor">Indoor</option>
                <option value="balcony">Balcony</option>
                <option value="outdoor">Outdoor Garden</option>
                <option value="greenhouse">Greenhouse</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sunlight
              </label>
              <select
                value={sunlightNeeds}
                onChange={(e) => setSunlightNeeds(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-xs"
              >
                <option value="indirect">Bright Indirect</option>
                <option value="direct">Direct Full Sun</option>
                <option value="low">Low Light</option>
                <option value="shade">Full Shade</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Watering Cycle
              </label>
              <select
                value={wateringDays}
                onChange={(e) => setWateringDays(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-xs"
              >
                <option value="2">Every 2 days</option>
                <option value="3">Every 3 days</option>
                <option value="5">Every 5 days</option>
                <option value="7">Every 7 days (Weekly)</option>
                <option value="10">Every 10 days</option>
                <option value="14">Every 2 weeks</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes & Soil Mix (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Repotted in terracotta with chunky perlite mix on windowsill..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-xs"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding Plant...</span>
                </>
              ) : (
                <>
                  <Sprout className="w-4 h-4" />
                  <span>Save to Garden</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onMediaSelected={(url) => setImageUrl(url)}
      />
    </div>
  );
}
