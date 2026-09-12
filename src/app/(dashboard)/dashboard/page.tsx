'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Camera,
  Plus,
  Flower2,
  AlertTriangle,
  CalendarCheck,
  Sparkles,
  CloudSun,
  ArrowRight,
  CheckCircle2,
  Droplets,
  Wind,
  Thermometer,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { SeverityBadge } from '@/components/diagnosis/SeverityBadge';
import { CameraCaptureModal } from '@/components/camera/CameraCaptureModal';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [plants, setPlants] = useState<any[]>([]);
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [plantsRes, weatherRes, tasksRes] = await Promise.all([
          apiClient.plants.list().catch(() => ({ plants: [] })),
          apiClient.weather.get().catch(() => ({ advisory: null })),
          apiClient.careTasks.list().catch(() => ({ tasks: [] })),
        ]);

        setPlants(plantsRes.plants || []);
        setWeather(weatherRes.advisory);
        setTasks(tasksRes.tasks || []);

        // Load diagnoses for the first plant or user
        const diagRes = await fetch('/api/diagnose').then((r) => r.json()).catch(() => ({ diagnoses: [] }));
        setDiagnoses(diagRes.diagnoses || []);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTaskToggle = async (taskId: string) => {
    try {
      const res = await apiClient.careTasks.toggle(taskId);
      if (res.task) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? res.task : t)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMediaCaptured = (mediaUrl: string, mediaType: 'image' | 'video') => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('plantinia_scan_media', mediaUrl);
      sessionStorage.setItem('plantinia_scan_type', mediaType);
      router.push('/diagnose');
    }
  };

  const healthyCount = plants.filter((p) => p.healthStatus === 'healthy').length;
  const healthScore = plants.length > 0 ? Math.round((healthyCount / plants.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Scan Callout */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Autonomous Botanical AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            How are your plants thriving today?
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
            Detect 120+ pathogens, pests, and nutrient deficiencies with leaf computer vision and emergency organic protocols.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCameraOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-emerald-950 font-bold text-sm shadow-md hover:bg-emerald-50 active:scale-95 transition-all"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Diagnose Leaf Now</span>
            </button>
            <Link
              href="/plants/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600/60 hover:bg-emerald-600 border border-emerald-400/40 text-white font-semibold text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Plant</span>
            </Link>
          </div>
        </div>

        {/* Decorative Leaf Background Pattern */}
        <div className="absolute right-0 -bottom-10 opacity-15 pointer-events-none transform translate-x-12 translate-y-6">
          <Flower2 className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Garden Health Score */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Health Score</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {healthScore}%
            </span>
            <span className="text-xs text-slate-400">average</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {plants.length} specimens monitored
          </p>
        </div>

        {/* Attention Alerts */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Needs Attention</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {plants.filter((p) => p.healthStatus !== 'healthy').length}
            </span>
            <span className="text-xs text-slate-400">plants</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Actionable treatments ready</p>
        </div>

        {/* Pending Care Tasks */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Tasks Today</span>
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {tasks.filter((t) => !t.isCompleted).length}
            </span>
            <span className="text-xs text-slate-400">due</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Watering & foliar sprays</p>
        </div>

        {/* Weather Agronomy */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Microclimate</span>
            <CloudSun className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {weather ? `${weather.temperatureC}°C` : '24°C'}
            </span>
            <span className="text-xs text-slate-400">{weather?.condition || 'Mild'}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Fungal Risk: <strong className="capitalize text-emerald-600 dark:text-emerald-400">{weather?.fungalRisk || 'Low'}</strong>
          </p>
        </div>
      </div>

      {/* Main Grid: Left Garden & Diagnoses, Right Weather & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Garden Plants Strip */}
          <div className="bg-white dark:bg-[#111815] p-5 rounded-3xl border border-slate-200 dark:border-[#223129] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">My Garden</h3>
                <p className="text-xs text-slate-500">Quick status overview of tracked plants</p>
              </div>
              <Link
                href="/plants"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>View All ({plants.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plants.slice(0, 4).map((plant) => (
                <Link
                  key={plant.id}
                  href={`/plants/${plant.id}`}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-[#1e2a24] hover:bg-slate-50 dark:hover:bg-[#151f1a] transition-all group"
                >
                  <img
                    src={plant.imageUrl}
                    alt={plant.name}
                    className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-800 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {plant.name}
                      </h4>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          plant.healthStatus === 'healthy'
                            ? 'bg-emerald-500'
                            : plant.healthStatus === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-slate-500 italic truncate">{plant.species}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <Droplets className="w-3 h-3 text-sky-500 inline" />
                      <span>Every {plant.wateringFrequencyDays} days</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent AI Diagnoses */}
          <div className="bg-white dark:bg-[#111815] p-5 rounded-3xl border border-slate-200 dark:border-[#223129] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent AI Diagnoses</h3>
                <p className="text-xs text-slate-500">Pathology findings and treatment logs</p>
              </div>
              <button
                onClick={() => setIsCameraOpen(true)}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>New Scan</span>
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {diagnoses.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No scans recorded yet. Tap &apos;Diagnose Leaf Now&apos; to run your first AI diagnosis!
              </div>
            ) : (
              <div className="space-y-3">
                {diagnoses.slice(0, 3).map((diag) => (
                  <Link
                    key={diag.id}
                    href={`/diagnose/result/${diag.id}`}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-100 dark:border-[#1e2a24] hover:bg-slate-50 dark:hover:bg-[#151f1a] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={diag.mediaUrl}
                        alt="Diagnosis scan"
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
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
                      <SeverityBadge severity={diag.severity} />
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Weather Advisory & Care Checklist */}
        <div className="space-y-6">
          {/* Weather Agronomy Card */}
          {weather && (
            <div className="p-5 rounded-3xl bg-gradient-to-b from-sky-50 to-white dark:from-sky-950/30 dark:to-[#111815] border border-sky-100 dark:border-sky-900/40 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-sky-700 dark:text-sky-300 uppercase tracking-wider">
                  Microclimate Agronomy
                </span>
                <CloudSun className="w-5 h-5 text-sky-500" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {weather.temperatureC}°C
                  </span>
                  <span className="block text-xs text-slate-500">{weather.location}</span>
                </div>
                <div className="text-right text-xs text-slate-500 space-y-1">
                  <div className="flex items-center gap-1 justify-end">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" />
                    <span>{weather.humidityPct}% Humidity</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <Wind className="w-3.5 h-3.5 text-teal-500" />
                    <span>{weather.windSpeedKmH} km/h</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-[#151f1a] border border-sky-100 dark:border-sky-900/30 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold text-sky-700 dark:text-sky-400 block mb-0.5">
                  AI Watering Advisory:
                </span>
                {weather.wateringAdvice}
              </div>
            </div>
          )}

          {/* Daily Care Checklist */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Today&apos;s Care Tasks</h3>
              <Link href="/care-plans" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">All caught up! No pending tasks.</p>
              ) : (
                tasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskToggle(task.id)}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#18231d] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={task.isCompleted}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-medium ${
                          task.isCompleted
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.plantName && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {task.plantName}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onMediaSelected={handleMediaCaptured}
      />
    </div>
  );
}
