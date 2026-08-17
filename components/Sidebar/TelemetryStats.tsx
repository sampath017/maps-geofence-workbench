'use client';

import React from 'react';
import { Activity, Clock, Navigation2, Zap, BatteryCharging, Info, MousePointerClick } from 'lucide-react';
import { TelemetryStats } from '@/lib/types';
import { DEFAULT_WH_PER_KM } from '@/lib/mapConfig';

interface TelemetryStatsProps {
  stats: TelemetryStats;
  onSpeedChange: (speed: number) => void;
}

export default function TelemetryStatsPanel({ stats, onSpeedChange }: TelemetryStatsProps) {
  const speedPresets = [
    { label: 'Cycle (20)', speed: 20 },
    { label: 'Urban (30)', speed: 30 },
    { label: 'Arterial (50)', speed: 50 },
    { label: 'Express (80)', speed: 80 },
  ];

  return (
    <div className="space-y-5">
      {/* Primary Telemetry Grid */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-dim flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-cyan" />
            Live Telemetry Readout
          </span>
          <span className="font-mono text-[10px] text-text-muted">Realtime</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Vertices */}
          <div className="p-3 rounded-md bg-panel-light border border-border">
            <div className="font-mono text-2xl font-bold text-cyan tracking-tight">
              {stats.pointCount}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-dim mt-0.5">
              Path Vertices
            </div>
          </div>

          {/* Markers */}
          <div className="p-3 rounded-md bg-panel-light border border-border">
            <div className="font-mono text-2xl font-bold text-emerald tracking-tight">
              {stats.markerCount}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-dim mt-0.5">
              Waypoint Pins
            </div>
          </div>

          {/* Distance */}
          <div className="p-3 rounded-md bg-panel-light border border-border">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-bold text-amber tracking-tight">
                {stats.distanceKm.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-text-dim">km</span>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-dim mt-0.5">
              {stats.distanceMiles.toFixed(2)} miles
            </div>
          </div>

          {/* Ride Time */}
          <div className="p-3 rounded-md bg-panel-light border border-border">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-bold text-text tracking-tight">
                {stats.distanceKm > 0 ? stats.durationMin.toFixed(0) : '0'}
              </span>
              <span className="text-xs font-mono text-text-dim">min</span>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-dim mt-0.5 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-text-muted" />@{stats.speedKmh} km/h
            </div>
          </div>
        </div>
      </div>

      {/* Speed Simulator & Vehicle Profile */}
      <div className="p-3 rounded-md bg-panel-light border border-border space-y-3">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-text-dim flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide">
            <Navigation2 className="w-3.5 h-3.5 text-amber" />
            Vehicle Simulation Speed
          </span>
          <span className="font-mono text-amber font-bold">{stats.speedKmh} km/h</span>
        </div>

        <input
          type="range"
          min="10"
          max="120"
          step="5"
          value={stats.speedKmh}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full cursor-pointer"
        />

        <div className="flex items-center justify-between gap-1.5 pt-1">
          {speedPresets.map((preset) => (
            <button
              key={preset.speed}
              onClick={() => onSpeedChange(preset.speed)}
              className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                stats.speedKmh === preset.speed
                  ? 'bg-amber text-background font-bold'
                  : 'bg-background text-text-dim hover:text-text border border-border hover:border-text-dim'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Energy / Consumption Estimate */}
      <div className="p-3 rounded-md bg-panel-light border border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-emerald/10 text-emerald border border-emerald/20">
            <BatteryCharging className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-text">Est. Battery Draw</div>
            <div className="text-[10px] text-text-dim font-mono">
              @ {DEFAULT_WH_PER_KM} Wh/km baseline
            </div>
          </div>
        </div>
        <div className="text-right font-mono">
          <span className="text-sm font-bold text-emerald">
            {(stats.distanceKm * DEFAULT_WH_PER_KM).toFixed(0)}
          </span>
          <span className="text-[10px] text-text-dim ml-1">Wh</span>
        </div>
      </div>

      {/* Map Legend */}
      <div className="p-3 rounded-md bg-background/50 border border-border">
        <div className="text-[10px] font-mono uppercase tracking-widest text-text-dim mb-2 flex items-center gap-1.5">
          <Info className="w-3 h-3 text-text-muted" />
          Visual Legend
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-text-dim">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber inline-block" />
            <span>Active Path</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan inline-block shadow-[0_0_6px_#4fd1c5]" />
            <span>Waypoints</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald inline-block shadow-[0_0_6px_#10b981]" />
            <span>Origin Point</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm border border-cyan/50 bg-cyan/10 inline-block" />
            <span>Geofence Zone</span>
          </div>
        </div>
      </div>

      {/* Editing Help */}
      <div className="p-3 rounded-md bg-panel-light/60 border border-border text-xs text-text-dim space-y-1.5">
        <div className="font-semibold text-text flex items-center gap-1.5 text-[11px]">
          <MousePointerClick className="w-3.5 h-3.5 text-amber" />
          Quick Map Gestures
        </div>
        <p className="text-[11px] leading-relaxed text-text-muted">
          Use the <strong>Geoman Toolbar</strong> (top-right of map) to draw lines or markers.
          Click and drag any vertex or pin directly to reshape in real-time.
        </p>
      </div>
    </div>
  );
}
