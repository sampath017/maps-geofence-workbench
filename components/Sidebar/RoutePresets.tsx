'use client';

import React, { useState } from 'react';
import { RoutePreset } from '@/lib/types';
import { ROUTE_PRESETS } from '@/lib/mapConfig';
import { Sparkles, MapPin, Compass, ArrowRight, Loader2, Navigation } from 'lucide-react';

interface RoutePresetsProps {
  onSelectPreset: (preset: RoutePreset) => void;
  onFetchCustomRoute: (
    origin: { lat: number; lon: number; label: string },
    destination: { lat: number; lon: number; label: string }
  ) => void;
  isLoading: boolean;
}

export default function RoutePresetsPanel({
  onSelectPreset,
  onFetchCustomRoute,
  isLoading,
}: RoutePresetsProps) {
  const [customOriginLat, setCustomOriginLat] = useState('12.8373');
  const [customOriginLon, setCustomOriginLon] = useState('80.2255');
  const [customDestLat, setCustomDestLat] = useState('12.8480');
  const [customDestLon, setCustomDestLon] = useState('80.2398');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const oLat = parseFloat(customOriginLat);
    const oLon = parseFloat(customOriginLon);
    const dLat = parseFloat(customDestLat);
    const dLon = parseFloat(customDestLon);

    if (isNaN(oLat) || isNaN(oLon) || isNaN(dLat) || isNaN(dLon)) {
      alert('Please enter valid decimal coordinates');
      return;
    }

    onFetchCustomRoute(
      { lat: oLat, lon: oLon, label: `Custom Origin (${oLat.toFixed(4)}, ${oLon.toFixed(4)})` },
      { lat: dLat, lon: dLon, label: `Custom Dest (${dLat.toFixed(4)}, ${dLon.toFixed(4)})` }
    );
  };

  return (
    <div className="space-y-5">
      {/* Header Info */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-dim flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber" />
            Curated Route Presets
          </span>
          <span className="font-mono text-[10px] text-cyan">OSRM Engine</span>
        </div>
        <p className="text-xs text-text-dim leading-relaxed">
          Select a verified corridor to fetch realistic road-following waypoints via OSRM instead of
          straight lines.
        </p>
      </div>

      {/* Preset Route Cards */}
      <div className="space-y-2.5">
        {ROUTE_PRESETS.map((preset) => (
          <div
            key={preset.id}
            className="p-3.5 rounded-md bg-panel-light border border-border hover:border-amber/50 hover:bg-panel-hover transition-all group"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="text-xs font-semibold text-text group-hover:text-amber transition-colors">
                {preset.name}
              </h3>
              {preset.badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-amber/10 text-amber border border-amber/30">
                  {preset.badge}
                </span>
              )}
            </div>

            <p className="text-[11px] text-text-dim mb-3 leading-relaxed">
              {preset.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[10px] font-mono text-text-muted">
              <span className="truncate max-w-[170px]">{preset.origin.label.split('—')[1] || preset.origin.label}</span>
              <ArrowRight className="w-3 h-3 text-text-dim flex-shrink-0" />
              <span className="truncate max-w-[170px] text-right">{preset.destination.label.split('—')[1] || preset.destination.label}</span>
            </div>

            <button
              onClick={() => onSelectPreset(preset)}
              disabled={isLoading}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-semibold bg-background hover:bg-amber hover:text-background text-text border border-border hover:border-amber transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-amber group-hover:text-background" />
              )}
              <span>Load This Route</span>
            </button>
          </div>
        ))}
      </div>

      {/* Custom Coordinates Generator */}
      <div className="p-3.5 rounded-md bg-panel-light border border-border space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-text">
          <Compass className="w-3.5 h-3.5 text-cyan" />
          <span>Custom Coordinate Router</span>
        </div>
        <p className="text-[11px] text-text-dim">
          Specify exact GPS endpoints to generate turn-by-turn road waypoints:
        </p>

        <form onSubmit={handleCustomSubmit} className="space-y-2.5">
          {/* Origin Inputs */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-emerald mb-1">
              Origin (Lat / Lon)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={customOriginLat}
                onChange={(e) => setCustomOriginLat(e.target.value)}
                placeholder="Latitude"
                className="bg-background border border-border rounded px-2 py-1 text-xs font-mono text-text focus:outline-none focus:border-cyan"
              />
              <input
                type="text"
                value={customOriginLon}
                onChange={(e) => setCustomOriginLon(e.target.value)}
                placeholder="Longitude"
                className="bg-background border border-border rounded px-2 py-1 text-xs font-mono text-text focus:outline-none focus:border-cyan"
              />
            </div>
          </div>

          {/* Destination Inputs */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-amber mb-1">
              Destination (Lat / Lon)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={customDestLat}
                onChange={(e) => setCustomDestLat(e.target.value)}
                placeholder="Latitude"
                className="bg-background border border-border rounded px-2 py-1 text-xs font-mono text-text focus:outline-none focus:border-cyan"
              />
              <input
                type="text"
                value={customDestLon}
                onChange={(e) => setCustomDestLon(e.target.value)}
                placeholder="Longitude"
                className="bg-background border border-border rounded px-2 py-1 text-xs font-mono text-text focus:outline-none focus:border-cyan"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-semibold bg-cyan/15 hover:bg-cyan hover:text-background text-cyan border border-cyan/40 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span>Calculate Road Route</span>
          </button>
        </form>
      </div>
    </div>
  );
}
