'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Droplets,
  Sun,
  Calendar,
  AlertTriangle,
  Plus,
  Trash2,
  ScanLine,
  MessageSquareText,
  Clock,
  Sparkles,
  Camera,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { SeverityBadge } from '@/components/diagnosis/SeverityBadge';

export default function PlantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const plantId = params?.id as string;

  const [plant, setPlant] = useState<any>(null);
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Event Form Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventType, setEventType] = useState('note');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!plantId) return;
    loadPlantData();
  }, [plantId]);

  async function loadPlantData() {
    try {
      const res = await apiClient.plants.get(plantId);
      setPlant(res.plant);
      setDiagnoses(res.diagnoses || []);
      setTimeline(res.timeline || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleWaterNow = async () => {
    try {
      await apiClient.plants.addTimelineEvent(plantId, {
        eventType: 'watering',
        title: 'Watered Plant',
        description: 'Applied full hydration until soil drainage was observed.',
      });
      await loadPlantData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTimelineEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle) return;
    setIsSubmitting(true);
    try {
      await apiClient.plants.addTimelineEvent(plantId, {
        eventType,
        title: eventTitle,
        description: eventDesc,
      });
      setIsEventModalOpen(false);
      setEventTitle('');
      setEventDesc('');
      await loadPlantData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlant = async () => {
    if (confirm(`Are you sure you want to remove ${plant.name} from your garden?`)) {
      await apiClient.plants.delete(plantId);
      router.push('/plants');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading plant profile...</div>;
  }

  if (!plant) {
    return (
      <div className="py-20 text-center space-y-3">
        <h3 className="text-base font-bold">Plant Not Found</h3>
        <Link href="/plants" className="text-xs text-emerald-600 underline">
          Back to Garden
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/plants"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Garden</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/diagnose?plantId=${plant.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
          >
            <ScanLine className="w-4 h-4" />
            <span>Scan Specimen</span>
          </Link>
          <button
            onClick={handleDeletePlant}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Remove plant"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Plant Profile Card */}
      <div className="bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-[#223129] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <img
            src={plant.imageUrl}
            alt={plant.name}
            className="w-full sm:w-48 h-48 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-800"
          />

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{plant.name}</h1>
                <p className="text-xs text-slate-500 italic mt-0.5">{plant.species}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                  plant.healthStatus === 'healthy'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                }`}
              >
                {plant.healthStatus}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {plant.notes || 'No notes added yet.'}
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#18231d] text-center">
                <Droplets className="w-4 h-4 text-sky-500 mx-auto mb-1" />
                <span className="block text-[10px] text-slate-400">Water Cycle</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Every {plant.wateringFrequencyDays} days
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#18231d] text-center">
                <Sun className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <span className="block text-[10px] text-slate-400">Sunlight</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {plant.sunlightNeeds}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#18231d] text-center">
                <Calendar className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <span className="block text-[10px] text-slate-400">Location</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {plant.location}
                </span>
              </div>
            </div>

            {/* Water Action */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleWaterNow}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold hover:scale-102 transition-transform"
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Watered Today</span>
              </button>
              <Link
                href={`/chat?plantId=${plant.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>Ask Doctor About Plant</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Medical Scans & Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Past AI Diagnoses */}
        <div className="bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-[#223129] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Medical Scan History</h3>
            <span className="text-xs text-slate-400">{diagnoses.length} recorded</span>
          </div>

          {diagnoses.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No pathology scans yet.</p>
          ) : (
            <div className="space-y-3">
              {diagnoses.map((diag) => (
                <Link
                  key={diag.id}
                  href={`/diagnose/result/${diag.id}`}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-[#18231d] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img src={diag.mediaUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {diag.diseaseName}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(diag.createdAt).toLocaleDateString()} • {diag.confidence}%
                      </span>
                    </div>
                  </div>
                  <SeverityBadge severity={diag.severity} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Growth & Care Timeline */}
        <div className="bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-[#223129] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Care Journey Timeline</h3>
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Event</span>
            </button>
          </div>

          {timeline.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Timeline is empty.</p>
          ) : (
            <div className="space-y-3 border-l-2 border-slate-100 dark:border-slate-800 ml-2 pl-4">
              {timeline.map((event) => (
                <div key={event.id} className="relative space-y-1">
                  <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-[#111815]"></div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {event.title}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{event.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-[#223129] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Log Garden Timeline Event
            </h3>

            <form onSubmit={handleAddTimelineEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Event Category
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-xs"
                >
                  <option value="watering">Watering</option>
                  <option value="fertilizing">Fertilizing</option>
                  <option value="pruning">Pruning</option>
                  <option value="repotting">Repotting</option>
                  <option value="note">General Growth Note</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Added worm castings, Repotted to 10-inch terracotta"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Observations, dose used, new leaves..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
