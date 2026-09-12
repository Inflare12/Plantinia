'use client';

import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  Sun,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function WeatherPage() {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
  }, []);

  async function loadWeather() {
    setLoading(true);
    try {
      const res = await apiClient.weather.get();
      setWeather(res.advisory);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Microclimate Agronomy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time weather tracking synced with pathogen spore growth cycles and watering requirements.
          </p>
        </div>

        <button
          onClick={loadWeather}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#151f1a] transition-colors"
          title="Refresh Weather"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {weather && (
        <div className="space-y-6">
          {/* Main Forecast Hero */}
          <div className="bg-gradient-to-br from-teal-700 via-emerald-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  {weather.location}
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-extrabold">{weather.temperatureC}°C</span>
                  <span className="text-sm text-emerald-200 font-medium">{weather.condition}</span>
                </div>
                <p className="text-xs text-emerald-100/80 max-w-md leading-relaxed">
                  {weather.wateringAdvice}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center">
                  <Droplets className="w-5 h-5 text-sky-300 mx-auto mb-1" />
                  <span className="block text-[10px] text-emerald-200">Humidity</span>
                  <span className="text-sm font-bold">{weather.humidityPct}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center">
                  <Sun className="w-5 h-5 text-amber-300 mx-auto mb-1" />
                  <span className="block text-[10px] text-emerald-200">UV Index</span>
                  <span className="text-sm font-bold">{weather.uvIndex} / 11</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center">
                  <Wind className="w-5 h-5 text-teal-300 mx-auto mb-1" />
                  <span className="block text-[10px] text-emerald-200">Wind</span>
                  <span className="text-sm font-bold">{weather.windSpeedKmH} km/h</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center">
                  <AlertTriangle className="w-5 h-5 text-rose-300 mx-auto mb-1" />
                  <span className="block text-[10px] text-emerald-200">Fungal Risk</span>
                  <span className="text-sm font-bold capitalize">{weather.fungalRisk}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Agronomic Risk Advisories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Pathogen Spore Forecast
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Fungal pressure: <strong className="capitalize">{weather.fungalRisk}</strong>
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {weather.fungalRisk === 'high'
                  ? 'High humidity combined with warm temperatures stimulates rapid powdery mildew and late blight germination. Prune lower canopy for air circulation and withhold overhead irrigation.'
                  : 'Current atmospheric moisture is within healthy limits for indoor and outdoor plants. Maintain standard preventative neem or bio-fungicide spray schedules.'}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-[#223129] shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600">
                  <Droplets className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Evapotranspiration Index
                  </h3>
                  <span className="text-[11px] text-slate-500">Soil moisture retention rate</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {weather.wateringAdvice}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
