'use client';

import React, { useState } from 'react';
import { Camera, Upload, Video, X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { captureFromCamera, pickMediaFile } from '@/lib/device/camera';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMediaSelected: (mediaUrl: string, mediaType: 'image' | 'video') => void;
}

const SAMPLE_DISEASE_IMAGES = [
  {
    name: 'Tomato Late Blight',
    url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&auto=format&fit=crop&q=80',
    type: 'image' as const,
  },
  {
    name: 'Rose Black Spot',
    url: 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=600&auto=format&fit=crop&q=80',
    type: 'image' as const,
  },
  {
    name: 'Monstera Chlorosis',
    url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&auto=format&fit=crop&q=80',
    type: 'image' as const,
  },
];

export function CameraCaptureModal({ isOpen, onClose, onMediaSelected }: CameraCaptureModalProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  if (!isOpen) return null;

  const handleCameraSnap = async () => {
    setIsCapturing(true);
    try {
      const media = await captureFromCamera();
      if (media?.dataUrl) {
        onMediaSelected(media.dataUrl, media.type);
        onClose();
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFilePick = async (accept: string) => {
    setIsCapturing(true);
    try {
      const media = await pickMediaFile(accept);
      if (media?.dataUrl) {
        onMediaSelected(media.dataUrl, media.type);
        onClose();
      }
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl safe-bottom">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-500" />
              Capture Plant Specimen
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hold camera 4–8 inches away with focused lighting.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Capture Action Grid */}
        <div className="grid grid-cols-3 gap-3 my-6">
          <button
            onClick={handleCameraSnap}
            disabled={isCapturing}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 hover:scale-102 active:scale-98 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold">Take Photo</span>
            <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">Camera</span>
          </button>

          <button
            onClick={() => handleFilePick('image/*')}
            disabled={isCapturing}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:scale-102 active:scale-98 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold">Gallery</span>
            <span className="text-[10px] text-slate-400">Upload Image</span>
          </button>

          <button
            onClick={() => handleFilePick('video/*')}
            disabled={isCapturing}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 hover:scale-102 active:scale-98 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold">Video Scan</span>
            <span className="text-[10px] text-teal-600/70 dark:text-teal-400/70">Pro Feature</span>
          </button>
        </div>

        {/* Try Sample Specimens */}
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Or test with sample plant specimens:
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_DISEASE_IMAGES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onMediaSelected(sample.url, sample.type);
                  onClose();
                }}
                className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video hover:ring-2 hover:ring-emerald-500 transition-all text-left"
              >
                <img
                  src={sample.url}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-1.5 flex items-end">
                  <span className="text-[10px] font-medium text-white line-clamp-1">{sample.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
