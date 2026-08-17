'use client';

import React, { useState } from 'react';
import { Coordinate, WaypointMarker } from '@/lib/types';
import { distanceMeters, formatDistance } from '@/lib/geofence';
import { ShieldCheck, ShieldAlert, Target, CheckCircle2, XCircle, Search } from 'lucide-react';

interface GeofencePanelProps {
  path: Coordinate[];
  markers: WaypointMarker[];
}

export default function GeofencePanel({ path, markers }: GeofencePanelProps) {
  const [testLat, setTestLat] = useState('12.8406');
  const [testLon, setTestLon] = useState('80.2278');
  const [testRadius, setTestRadius] = useState('150');
  const [testResult, setTestResult] = useState<{
    inside: boolean;
    closestDist: number;
    pointsInside: number;
  } | null>(null);

  const handleRunTest = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(testLat);
    const lon = parseFloat(testLon);
    const radius = parseFloat(testRadius);

    if (isNaN(lat) || isNaN(lon) || isNaN(radius)) {
      alert('Enter valid test coordinates');
      return;
    }

    const testCenter: Coordinate = [lat, lon];
    let closestDist = Infinity;
    let insideCount = 0;

    path.forEach((pt) => {
      const d = distanceMeters(pt, testCenter);
      if (d < closestDist) closestDist = d;
      if (d <= radius) insideCount++;
    });

    setTestResult({
      inside: insideCount > 0,
      closestDist: closestDist === Infinity ? 0 : closestDist,
      pointsInside: insideCount,
    });
  };

  return (
    <div className="space-y-5">
      {/* Header Info */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-dim flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-cyan" />
            Geofence &amp; Tier-2 Trigger Engine
          </span>
          <span className="font-mono text-[10px] text-amber">Turf.js</span>
        </div>
        <p className="text-xs text-text-dim leading-relaxed">
          Sanity-check <code className="text-text font-mono">GEOFENCE_ENTER</code> and{' '}
          <code className="text-text font-mono">EXIT</code> thresholds against active telemetry
          trajectories before deploying to Jarvis.
        </p>
      </div>

      {/* Interactive Geofence Tester */}
      <div className="p-3.5 rounded-md bg-panel-light border border-border space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-text">
          <Target className="w-3.5 h-3.5 text-amber" />
          <span>Point-to-Path Geofence Inspector</span>
        </div>

        <form onSubmit={handleRunTest} className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono uppercase text-text-dim mb-1">
                Test Latitude
              </label>
              <input
                type="text"
                value={testLat}
                onChange={(e) => setTestLat(e.target.value)}
                className="w-full bg-background border border-border rounded px-2 py-1 text-xs font-mono text-text focus:outline-none focus:border-cyan"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-text-dim mb-1">
                Test Longitude
              </label>
              <input
                type="text"
                value={testLon}
                onChange={(e) => setTestLon(e.target.value)}
                className="w-full bg-background border border-border rounded px-2 py-1 text-xs font-mono text-text focus:outline-none focus:border-cyan"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[10px] font-mono text-text-dim mb-1">
              <span>Geofence Detection Radius</span>
              <span className="text-cyan font-bold">{testRadius} meters</span>
            </div>
            <input
              type="range"
              min="20"
              max="1000"
              step="10"
              value={testRadius}
              onChange={(e) => setTestRadius(e.target.value)}
              className="w-full cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={path.length === 0}
            className="w-full py-1.5 rounded text-xs font-semibold bg-cyan/15 hover:bg-cyan hover:text-background text-cyan border border-cyan/40 transition-colors disabled:opacity-50"
          >
            {path.length === 0 ? 'Load Path First' : 'Test Intersection Against Route'}
          </button>
        </form>

        {testResult && (
          <div
            className={`p-3 rounded border text-xs font-mono space-y-1 ${
              testResult.inside
                ? 'bg-emerald/10 border-emerald/40 text-emerald'
                : 'bg-crimson/10 border-crimson/40 text-crimson'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              {testResult.inside ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>GEOFENCE ENTER DETECTED</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>NO INTERSECTION DETECTED</span>
                </>
              )}
            </div>
            <div className="text-[11px] text-text-dim pt-1 space-y-0.5">
              <div>Closest Distance: <span className="text-text font-bold">{formatDistance(testResult.closestDist)}</span></div>
              <div>Waypoints within radius: <span className="text-text font-bold">{testResult.pointsInside}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Active Marker Radii Status */}
      <div className="space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-dim flex items-center gap-1.5">
          <ShieldAlert className="w-3 h-3 text-emerald" />
          Active Waypoint Geofence Zones
        </span>

        {markers.length === 0 ? (
          <p className="text-xs text-text-muted italic">No waypoint markers defined on canvas.</p>
        ) : (
          <div className="space-y-2">
            {markers.map((m, idx) => {
              const radius = m.radiusMeters || 100;
              let breachedCount = 0;
              path.forEach((pt) => {
                if (distanceMeters(pt, [m.lat, m.lon]) <= radius) breachedCount++;
              });

              return (
                <div
                  key={m.id || idx}
                  className="p-3 rounded-md bg-panel-light border border-border text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text truncate max-w-[200px]">{m.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                        breachedCount > 0
                          ? 'bg-emerald/15 text-emerald border border-emerald/30'
                          : 'bg-text-dim/10 text-text-dim border border-border'
                      }`}
                    >
                      {breachedCount > 0 ? `${breachedCount} pts inside` : 'Outside route'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-text-dim">
                    <span>Radius: {radius}m</span>
                    <span>
                      {m.lat.toFixed(4)}, {m.lon.toFixed(4)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
