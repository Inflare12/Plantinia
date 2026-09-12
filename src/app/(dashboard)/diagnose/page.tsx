'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Upload,
  Video,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Leaf,
  Layers,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { CameraCaptureModal } from '@/components/camera/CameraCaptureModal';

export default function DiagnosePage() {
  const router = useRouter();
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [plantSpeciesHint, setPlantSpeciesHint] = useState('');
  const [notes, setNotes] = useState('');
  const [plants, setPlants] = useState<any[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if media was passed via session storage from home screen
    if (typeof window !== 'undefined') {
      const storedMedia = sessionStorage.getItem('plantinia_scan_media');
      const storedType = sessionStorage.getItem('plantinia_scan_type') as 'image' | 'video';
      if (storedMedia) {
        setMediaUrl(storedMedia);
        if (storedType) setMediaType(storedType);
        sessionStorage.removeItem('plantinia_scan_media');
        sessionStorage.removeItem('plantinia_scan_type');
      }
    }

    apiClient.plants.list().then((res) => {
      setPlants(res.plants || []);
    }).catch(() => {});
  }, []);

  const handleStartAnalysis = async () => {
    if (!mediaUrl) {
      setError('Please provide a plant photo or video before diagnosing.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setAnalysisStep(1);

    const stepTimer = setInterval(() => {
      setAnalysisStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 900);

    try {
      const res = await apiClient.diagnose.scan({
        mediaUrl,
        mediaType,
        plantId: selectedPlantId || undefined,
        plantSpeciesHint: plantSpeciesHint || undefined,
        notes: notes || undefined,
      });

      clearInterval(stepTimer);
      router.push(`/diagnose/result/${res.diagnosis.id}`);
    } catch (err: any) {
      clearInterval(stepTimer);
      setIsAnalyzing(false);
      setError(err.message || 'Diagnosis failed. Please check internet connection or upload a clearer leaf picture.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Multimodal Plant Pathology Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          AI Plant Disease Diagnosis
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Take a photo or upload video of leaves, stems, or fruits showing discoloration or pest damage.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Specimen Preview / Upload Zone */}
      <div className="bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-[#223129] p-6 shadow-xs space-y-6">
        {mediaUrl ? (
          <div className="relative rounded-2xl overflow-hidden bg-black max-h-[380px] flex items-center justify-center">
            {mediaType === 'video' ? (
              <video src={mediaUrl} controls className="w-full max-h-[380px] object-contain" />
            ) : (
              <img src={mediaUrl} alt="Plant specimen" className="w-full max-h-[380px] object-contain" />
            )}

            {!isAnalyzing && (
              <button
                onClick={() => setMediaUrl(null)}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black text-white text-xs font-semibold backdrop-blur-xs transition-colors"
              >
                Change Specimen
              </button>
            )}

            {/* Scanning Line Animation while analyzing */}
            {isAnalyzing && (
              <div className="absolute inset-0 pointer-events-none bg-emerald-500/10 border-b-2 border-emerald-400 animate-scan-line shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
            )}
          </div>
        ) : (
          <div
            onClick={() => setIsCameraOpen(true)}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 sm:p-12 text-center hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 cursor-pointer transition-all group"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tap to Capture or Upload Specimen
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Use your device camera, select an image from gallery, or upload a 5-second video clip.
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <Camera className="w-3.5 h-3.5" /> Mobile Camera
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <Upload className="w-3.5 h-3.5" /> JPG, PNG, WEBP
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                <Video className="w-3.5 h-3.5" /> MP4 Video
              </span>
            </div>
          </div>
        )}

        {/* Optional Context Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Link to My Garden Plant (Optional)
            </label>
            <select
              value={selectedPlantId}
              onChange={(e) => setSelectedPlantId(e.target.value)}
              disabled={isAnalyzing}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">-- Standalone scan (do not save to plant) --</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Plant Species Hint (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Roma Tomato, Monstera, Rose"
              value={plantSpeciesHint}
              onChange={(e) => setPlantSpeciesHint(e.target.value)}
              disabled={isAnalyzing}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Observations or Symptoms (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Yellowing leaf edges, brown crunchy patches, white powder on tops..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isAnalyzing}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Diagnosis Action Button */}
        <div>
          <button
            onClick={handleStartAnalysis}
            disabled={!mediaUrl || isAnalyzing}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>
                  {analysisStep === 1
                    ? '1/3 Preprocessing leaf imagery...'
                    : analysisStep === 2
                    ? '2/3 Pathogen neural feature matching...'
                    : '3/3 Formulating organic & chemical treatment protocol...'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Run AI Diagnosis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onMediaSelected={(url, type) => {
          setMediaUrl(url);
          setMediaType(type);
        }}
      />
    </div>
  );
}
