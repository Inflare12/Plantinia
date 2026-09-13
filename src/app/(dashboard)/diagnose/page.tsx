'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, Video, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { CameraCaptureModal } from '@/components/camera/CameraCaptureModal';

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

async function uploadMedia(file: File): Promise<{ url: string; mediaType: 'image' | 'video' }> {
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) throw new Error('Media must be 4 MB or smaller. Please choose a shorter/smaller file.');
  const form = new FormData();
  form.append('file', file);
  const response = await fetch('/api/media/upload', { method: 'POST', body: form, credentials: 'include' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Media upload failed');
  return data;
}

function dataUrlToFile(dataUrl: string, type: 'image' | 'video'): File {
  const [meta, encoded] = dataUrl.split(',', 2);
  const mime = meta.match(/^data:([^;]+)/)?.[1] || (type === 'video' ? 'video/mp4' : 'image/jpeg');
  const binary = atob(encoded || '');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], `plant-${Date.now()}.${type === 'video' ? 'mp4' : 'jpg'}`, { type: mime });
}

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
  const [isUploading, setIsUploading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const restoreMedia = async () => {
      const storedMedia = sessionStorage.getItem('plantinia_scan_media');
      const storedType = sessionStorage.getItem('plantinia_scan_type') as 'image' | 'video';
      sessionStorage.removeItem('plantinia_scan_media');
      sessionStorage.removeItem('plantinia_scan_type');
      if (!storedMedia || cancelled) return;

      try {
        setIsUploading(true);
        const file = storedMedia.startsWith('data:') ? dataUrlToFile(storedMedia, storedType || 'image') : null;
        if (file) {
          const uploaded = await uploadMedia(file);
          if (!cancelled) { setMediaUrl(uploaded.url); setMediaType(uploaded.mediaType); }
        } else if (!cancelled && /^https:\/\//.test(storedMedia)) {
          setMediaUrl(storedMedia);
          setMediaType(storedType || 'image');
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Unable to prepare the selected media');
      } finally {
        if (!cancelled) setIsUploading(false);
      }
    };
    restoreMedia();
    apiClient.plants.list().then((res) => setPlants(res.plants || [])).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleMediaSelected = async (localUrl: string, type: 'image' | 'video', file?: File) => {
    setError(null);
    setMediaUrl(localUrl);
    setMediaType(type);
    if (!file) return;
    try {
      setIsUploading(true);
      const uploaded = await uploadMedia(file);
      setMediaUrl(uploaded.url);
      setMediaType(uploaded.mediaType);
    } catch (err: any) {
      setMediaUrl(null);
      setError(err.message || 'Media upload failed');
    } finally { setIsUploading(false); }
  };

  const handleStartAnalysis = async () => {
    if (!mediaUrl || isUploading) {
      setError(isUploading ? 'Please wait for the media upload to finish.' : 'Please provide a plant photo or video before diagnosing.');
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    setAnalysisStep(1);
    const stepTimer = setInterval(() => setAnalysisStep((prev) => (prev < 3 ? prev + 1 : prev)), 900);
    try {
      const res = await apiClient.diagnose.scan({ mediaUrl, mediaType, plantId: selectedPlantId || undefined, plantSpeciesHint: plantSpeciesHint || undefined, notes: notes || undefined });
      clearInterval(stepTimer);
      router.push(`/diagnose/result/${res.diagnosis.id}`);
    } catch (err: any) {
      clearInterval(stepTimer);
      setIsAnalyzing(false);
      setError(err.message || 'Diagnosis failed. Please check your connection or upload a clearer specimen.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2"><Sparkles className="w-3.5 h-3.5 text-emerald-500" /><span>Multimodal Plant Pathology Engine</span></div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">AI Plant Disease Diagnosis</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Take a photo or upload video of leaves, stems, or fruits showing discoloration or pest damage.</p>
      </div>

      {error && <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3"><AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><span>{error}</span></div>}

      <div className="bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-[#223129] p-6 shadow-xs space-y-6">
        {mediaUrl ? <div className="relative rounded-2xl overflow-hidden bg-black max-h-[380px] flex items-center justify-center">
          {mediaType === 'video' ? <video src={mediaUrl} controls className="w-full max-h-[380px] object-contain" /> : <img src={mediaUrl} alt="Plant specimen" className="w-full max-h-[380px] object-contain" />}
          {!isAnalyzing && !isUploading && <button onClick={() => setMediaUrl(null)} className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black text-white text-xs font-semibold">Change Specimen</button>}
          {(isAnalyzing || isUploading) && <div className="absolute inset-0 pointer-events-none bg-emerald-500/10 border-b-2 border-emerald-400 animate-scan-line" />}
          {isUploading && <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-xl bg-black/80 px-3 py-2 text-xs text-white">Uploading securely…</div>}
        </div> : <div onClick={() => setIsCameraOpen(true)} className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 sm:p-12 text-center hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 cursor-pointer transition-all group"><div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Camera className="w-8 h-8" /></div><h3 className="text-base font-bold text-slate-900 dark:text-white">Tap to Capture or Upload Specimen</h3><p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">Use your device camera, select an image from gallery, or upload a video clip up to 4 MB.</p><div className="flex items-center justify-center gap-3 mt-4"><span className="inline-flex items-center gap-1 text-[11px] text-slate-400"><Camera className="w-3.5 h-3.5" /> Mobile Camera</span><span className="inline-flex items-center gap-1 text-[11px] text-slate-400"><Upload className="w-3.5 h-3.5" /> JPG, PNG, WEBP</span><span className="inline-flex items-center gap-1 text-[11px] text-teal-600"><Video className="w-3.5 h-3.5" /> MP4 Video</span></div></div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Link to My Garden Plant (Optional)</label><select value={selectedPlantId} onChange={(e) => setSelectedPlantId(e.target.value)} disabled={isAnalyzing} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"><option value="">-- Standalone scan (do not save to plant) --</option>{plants.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Plant Species Hint (Optional)</label><input type="text" maxLength={1000} placeholder="e.g. Roma Tomato, Monstera, Rose" value={plantSpeciesHint} onChange={(e) => setPlantSpeciesHint(e.target.value)} disabled={isAnalyzing} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></div>
        </div>

        <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Observations or Symptoms (Optional)</label><textarea rows={2} maxLength={1000} placeholder="e.g. Yellowing leaf edges, brown crunchy patches, white powder on tops..." value={notes} onChange={(e) => setNotes(e.target.value)} disabled={isAnalyzing} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#18231d] text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></div>

        <button onClick={handleStartAnalysis} disabled={!mediaUrl || isAnalyzing || isUploading} className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2">{isAnalyzing ? <><Loader2 className="w-5 h-5 animate-spin" /><span>{analysisStep === 1 ? '1/3 Preprocessing specimen…' : analysisStep === 2 ? '2/3 Matching pathology features…' : '3/3 Formulating treatment protocol…'}</span></> : <><Sparkles className="w-5 h-5" /><span>Run AI Diagnosis</span></>}</button>
      </div>

      <CameraCaptureModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onMediaSelected={handleMediaSelected} />
    </div>
  );
}
