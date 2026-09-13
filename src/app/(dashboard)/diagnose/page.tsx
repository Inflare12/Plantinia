'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, Video, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { CameraCaptureModal } from '@/components/camera/CameraCaptureModal';

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

async function uploadMedia(file: File) {
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) throw new Error('Media must be 4 MB or smaller.');
  const form = new FormData(); form.append('file', file);
  const response = await fetch('/api/media/upload', { method: 'POST', body: form, credentials: 'include' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Media upload failed');
  return data as { url: string; mediaType: 'image' | 'video' };
}

function dataUrlToFile(dataUrl: string, type: 'image'|'video') {
  const [meta, encoded=''] = dataUrl.split(',',2);
  const mime = meta.match(/^data:([^;]+)/)?.[1] || (type === 'video' ? 'video/mp4' : 'image/jpeg');
  const binary = atob(encoded); const bytes = new Uint8Array(binary.length);
  for (let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
  return new File([bytes], `plant-${Date.now()}.${type==='video'?'mp4':'jpg'}`, {type:mime});
}

export default function DiagnosePage() {
  const router = useRouter();
  const [mediaUrl,setMediaUrl]=useState<string|null>(null);
  const [mediaType,setMediaType]=useState<'image'|'video'>('image');
  const [plantSpeciesHint,setPlantSpeciesHint]=useState('');
  const [notes,setNotes]=useState('');
  const [plants,setPlants]=useState<any[]>([]);
  const [selectedPlantId,setSelectedPlantId]=useState('');
  const [isCameraOpen,setIsCameraOpen]=useState(false);
  const [isAnalyzing,setIsAnalyzing]=useState(false);
  const [isUploading,setIsUploading]=useState(false);
  const [analysisStep,setAnalysisStep]=useState(0);
  const [error,setError]=useState<string|null>(null);

  useEffect(()=>{
    const hint=new URLSearchParams(window.location.search).get('hint');
    if(hint) setPlantSpeciesHint(hint.slice(0,1000));
    let cancelled=false;
    (async()=>{
      try {
        const res=await apiClient.plants.list(); if(!cancelled) setPlants(Array.isArray(res.plants)?res.plants:[]);
      } catch { if(!cancelled) setPlants([]); }
      const storedMedia=sessionStorage.getItem('plantinia_scan_media');
      const storedType=(sessionStorage.getItem('plantinia_scan_type') as 'image'|'video') || 'image';
      sessionStorage.removeItem('plantinia_scan_media'); sessionStorage.removeItem('plantinia_scan_type');
      if(!storedMedia || cancelled) return;
      try {
        setIsUploading(true);
        if(storedMedia.startsWith('data:')) { const uploaded=await uploadMedia(dataUrlToFile(storedMedia,storedType)); if(!cancelled){setMediaUrl(uploaded.url);setMediaType(uploaded.mediaType);} }
        else if(/^https:\/\//.test(storedMedia) && !cancelled){ setMediaUrl(storedMedia); setMediaType(storedType); }
      } catch(err:any){ if(!cancelled) setError(err?.message||'Unable to prepare selected media'); }
      finally { if(!cancelled) setIsUploading(false); }
    })();
    return ()=>{cancelled=true;};
  },[]);

  async function handleMediaSelected(localUrl:string,type:'image'|'video',file?:File){
    setError(null); setMediaUrl(localUrl); setMediaType(type);
    if(!file) return;
    try { setIsUploading(true); const uploaded=await uploadMedia(file); setMediaUrl(uploaded.url); setMediaType(uploaded.mediaType); }
    catch(err:any){ setMediaUrl(null); setError(err?.message||'Media upload failed'); }
    finally { setIsUploading(false); }
  }

  async function handleStartAnalysis(){
    if(!mediaUrl || isUploading){setError(isUploading?'Please wait for the media upload to finish.':'Please provide a plant photo or video before diagnosing.');return;}
    setError(null); setIsAnalyzing(true); setAnalysisStep(1);
    const timer=setInterval(()=>setAnalysisStep(v=>Math.min(3,v+1)),900);
    try { const res=await apiClient.diagnose.scan({mediaUrl,mediaType,plantId:selectedPlantId||undefined,plantSpeciesHint:plantSpeciesHint||undefined,notes:notes||undefined}); clearInterval(timer); router.push(`/diagnose/result/${res.diagnosis.id}`); }
    catch(err:any){clearInterval(timer);setIsAnalyzing(false);setError(err?.message||'Diagnosis failed. Please try again.');}
  }

  return <div className="max-w-3xl mx-auto space-y-6">
    <div><div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2"><Sparkles className="w-3.5 h-3.5 text-emerald-500"/>Multimodal Plant Pathology Engine</div><h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">AI Plant Disease Diagnosis</h1><p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Take a photo or upload a video of leaves, stems, or fruits showing symptoms.</p></div>
    {error&&<div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3"><AlertCircle className="w-5 h-5 shrink-0"/><span>{error}</span></div>}
    <div className="bg-white dark:bg-[#111815] rounded-3xl border border-slate-200 dark:border-[#223129] p-6 shadow-xs space-y-6">
      {mediaUrl?<div className="relative rounded-2xl overflow-hidden bg-black max-h-[380px] flex items-center justify-center">{mediaType==='video'?<video src={mediaUrl} controls className="w-full max-h-[380px] object-contain"/>:<img src={mediaUrl} alt="Plant specimen" className="w-full max-h-[380px] object-contain"/>}{!isAnalyzing&&!isUploading&&<button onClick={()=>setMediaUrl(null)} className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/70 text-white text-xs font-semibold">Change Specimen</button>}{isUploading&&<div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-xl bg-black/80 px-3 py-2 text-xs text-white">Uploading securely…</div>}</div>:<div onClick={()=>setIsCameraOpen(true)} className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 sm:p-12 text-center hover:border-emerald-500 cursor-pointer"><Camera className="w-12 h-12 text-emerald-500 mx-auto mb-3"/><h3 className="text-base font-bold text-slate-900 dark:text-white">Tap to Capture or Upload Specimen</h3><p className="text-xs text-slate-500 mt-1">Images and video clips up to 4 MB.</p><div className="flex justify-center gap-3 mt-4 text-[11px] text-slate-400"><span><Camera className="w-3.5 h-3.5 inline"/> Camera</span><span><Upload className="w-3.5 h-3.5 inline"/> Image</span><span><Video className="w-3.5 h-3.5 inline"/> Video</span></div></div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block text-xs font-semibold mb-1.5">Link to My Garden Plant (Optional)</label><select value={selectedPlantId} onChange={e=>setSelectedPlantId(e.target.value)} disabled={isAnalyzing} className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-[#18231d] text-xs"><option value="">-- Standalone scan --</option>{plants.map(p=><option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}</select></div><div><label className="block text-xs font-semibold mb-1.5">Plant Species Hint (Optional)</label><input maxLength={1000} value={plantSpeciesHint} onChange={e=>setPlantSpeciesHint(e.target.value)} disabled={isAnalyzing} placeholder="e.g. Monstera, Rose" className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-[#18231d] text-xs"/></div></div>
      <div><label className="block text-xs font-semibold mb-1.5">Observations or Symptoms (Optional)</label><textarea rows={2} maxLength={1000} value={notes} onChange={e=>setNotes(e.target.value)} disabled={isAnalyzing} placeholder="Yellow edges, brown patches, pests..." className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-[#18231d] text-xs"/></div>
      <button onClick={handleStartAnalysis} disabled={!mediaUrl||isAnalyzing||isUploading} className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2">{isAnalyzing?<><Loader2 className="w-5 h-5 animate-spin"/><span>{analysisStep===1?'1/3 Preprocessing specimen…':analysisStep===2?'2/3 Matching pathology features…':'3/3 Formulating treatment protocol…'}</span></>:<><Sparkles className="w-5 h-5"/>Run AI Diagnosis</>}</button>
    </div>
    <CameraCaptureModal isOpen={isCameraOpen} onClose={()=>setIsCameraOpen(false)} onMediaSelected={handleMediaSelected}/>
  </div>;
}
